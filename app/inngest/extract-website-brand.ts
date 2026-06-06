import { inngest } from '@/lib/inngest'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export const extractWebsiteBrand = inngest.createFunction(
  { id: 'extract-website-brand', retries: 2, triggers: [{ event: 'brand/website.extract.requested' }] },
  async ({ event, step }: { event: any; step: any }) => {
    const { brandId, guidelineId, url } = event.data

    await step.run('mark-processing', async () => {
      await prisma.brandGuideline.update({ where: { id: guidelineId }, data: { status: 'PROCESSING' } })
    })

    const structuralData = await step.run('scrape-html', async () => {
      const res = await fetch(url, { headers: { 'User-Agent': 'BrandAlchemist/1.0 (+https://brand-alchemist.com)' } })
      const html = await res.text()
      const cheerio = await import('cheerio')
      const $ = cheerio.load(html)

      const ogImage = $('meta[property="og:image"]').attr('content') || ''
      const ogName = $('meta[property="og:site_name"]').attr('content') || $('title').text() || ''
      const headings = [$('h1').first().text(), $('h2').first().text()].filter(Boolean)

      // Extract colors and fonts from inline styles and style tags
      const cssContent = $('style').map((_: number, el: any) => $(el).html()).get().join('\n')
      const hexColors = [...new Set([...cssContent.matchAll(/(#[0-9A-Fa-f]{6})\b/g)].map((m: RegExpMatchArray) => m[1]))].slice(0, 20)
      const fonts = [...new Set([...cssContent.matchAll(/font-family\s*:\s*([^;,}]+)/gi)].map((m: RegExpMatchArray) => m[1].trim().replace(/['"]/g, '').split(',')[0].trim()))].filter((f: string) => f.length > 1 && !f.startsWith('var(')).slice(0, 5)

      return { ogImage, ogName, headings, hexColors, fonts }
    })

    const visionResult = await step.run('screenshot-vision', async () => {
      const screenshotUrl = `https://api.microlink.io/screenshot?url=${encodeURIComponent(url)}&overlay.browser=false&meta=false&screenshot=true`
      const res = await fetch(screenshotUrl)
      const data = await res.json()
      const imageUrl = data?.data?.screenshot?.url || data?.data?.image?.url

      let imageBase64 = ''
      if (imageUrl) {
        const imgRes = await fetch(imageUrl)
        const buf = await imgRes.arrayBuffer()
        imageBase64 = Buffer.from(buf).toString('base64')
      }

      if (!imageBase64) return {}

      const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/png;base64,${imageBase64}`, detail: 'high' },
            },
            {
              type: 'text',
              text: `Analyze this website screenshot for brand identity. Return ONLY valid JSON:
{"primaryColors":[{"hex":"#XXXXXX","name":"color name"}],"secondaryColors":[{"hex":"#XXXXXX"}],"fonts":[{"name":"Font Name"}],"toneKeywords":["keyword"],"tagline":"tagline if visible"}`,
            },
          ],
        }],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      })
      try { return JSON.parse(response.choices[0].message.content || '{}') }
      catch { return {} }
    })

    await step.run('merge-and-save', async () => {
      const allColors = [
        ...(visionResult.primaryColors || []),
        ...(visionResult.secondaryColors || []),
        ...structuralData.hexColors.map((hex: string) => ({ hex, name: 'CSS color' })),
      ]
      const uniqueColors = allColors.filter((c: { hex: string }, i: number, arr: { hex: string }[]) => arr.findIndex((x: { hex: string }) => x.hex === c.hex) === i).slice(0, 8)
      const allFonts = [
        ...(visionResult.fonts || []),
        ...structuralData.fonts.map((name: string) => ({ name })),
      ]
      const uniqueFonts = allFonts.filter((f: { name: string }, i: number, arr: { name: string }[]) => arr.findIndex((x: { name: string }) => x.name === f.name) === i).slice(0, 4)

      const merged = {
        colors: uniqueColors,
        fonts: uniqueFonts,
        toneKeywords: visionResult.toneKeywords || [],
        tagline: visionResult.tagline || structuralData.headings[0] || '',
        sourceName: structuralData.ogName,
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
            tone: merged.toneKeywords.slice(0, 5),
            tagline: merged.tagline || undefined,
          },
        })
      }
    })
  }
)
