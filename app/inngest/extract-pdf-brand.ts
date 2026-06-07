import { inngest } from '@/lib/inngest'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getAssetBuffer } from '@/lib/storage'
import pdfParse from 'pdf-parse'

export const extractPdfBrand = inngest.createFunction(
  { id: 'extract-pdf-brand', retries: 2, triggers: [{ event: 'brand/pdf.extract.requested' }] },
  async ({ event, step }: { event: any; step: any }) => {
    const { brandId, guidelineId, assetKey } = event.data

    await step.run('mark-processing', async () => {
      await prisma.brandGuideline.update({ where: { id: guidelineId }, data: { status: 'PROCESSING' } })
    })

    const visionResult = await step.run('extract-text', async () => {
      const fileBuffer = await getAssetBuffer(assetKey)
      const parsed = await pdfParse(fileBuffer)
      const text = parsed.text.slice(0, 12_000) // ~3k tokens, enough for brand guidelines

      const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [{
          role: 'user',
          content: `Analyze this brand guideline document text and extract brand identity information. Return ONLY valid JSON:
{"colors":[{"hex":"#XXXXXX","name":"Color name","usage":"where used"}],"fonts":[{"name":"Font Family Name","usage":"heading/body"}],"taglines":["tagline text"],"voiceKeywords":["keyword1","keyword2"]}

Document text:
${text}

Return only the JSON, no other text.`,
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
    })
  }
)
