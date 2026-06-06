import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { extractPdfBrand } from '@/app/inngest/extract-pdf-brand'
import { extractWebsiteBrand } from '@/app/inngest/extract-website-brand'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [extractPdfBrand, extractWebsiteBrand],
})
