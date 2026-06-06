import { inngest } from '@/lib/inngest'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { R2_PUBLIC_URL } from '@/lib/r2'

export const extractPdfBrand = inngest.createFunction(
  { id: 'extract-pdf-brand', retries: 2, triggers: [{ event: 'brand/pdf.extract.requested' }] },
  async ({ event, step }: { event: any; step: any }) => {
    const { brandId, guidelineId, assetKey } = event.data

    await step.run('mark-processing', async () => {
      await prisma.brandGuideline.update({ where: { id: guidelineId }, data: { status: 'PROCESSING' } })
    })

    const visionResult = await step.run('extract-vision', async () => {
      const url = `${R2_PUBLIC_URL}/${assetKey}`
      const fileRes = await fetch(url)
      const fileBuffer = Buffer.from(await fileRes.arrayBuffer())
      const file = await openai.files.create({
        file: new File([fileBuffer], 'brand-guidelines.pdf', { type: 'application/pdf' }),
        purpose: 'user_data',
      })
      await prisma.brandGuideline.update({ where: { id: guidelineId }, data: { openaiFileId: file.id } })

      const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'file', file: { file_id: file.id } } as any,
            {
              type: 'text',
              text: `Analyze this brand guideline document. Extract all brand identity information and return ONLY valid JSON:
{"colors":[{"hex":"#XXXXXX","name":"Color name","usage":"where used"}],"fonts":[{"name":"Font Family Name","usage":"heading/body"}],"taglines":["tagline text"],"voiceKeywords":["keyword1","keyword2"]}
Return only the JSON, no other text.`,
            },
          ],
        }],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      })

      try {
        return JSON.parse(response.choices[0].message.content || '{}')
      } catch { return {} }
    })

    await step.run('save', async () => {
      const merged = {
        colors: (visionResult.colors || []).slice(0, 10),
        fonts: (visionResult.fonts || []).slice(0, 5),
        taglines: visionResult.taglines || [],
        voiceKeywords: visionResult.voiceKeywords || [],
      }

      await prisma.brandGuideline.update({
        where: { id: guidelineId },
        data: { status: 'COMPLETED', extractedData: merged },
      })

      if (merged.colors.length > 0) {
        await prisma.brand.update({
          where: { id: brandId },
          data: {
            primaryColor: merged.colors[0]?.hex,
            secondaryColor: merged.colors[1]?.hex,
            fontHeading: merged.fonts[0]?.name,
            fontBody: merged.fonts[1]?.name,
            tone: merged.voiceKeywords.slice(0, 5),
          },
        })
      }
    })
  }
)
