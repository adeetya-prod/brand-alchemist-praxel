'use client'
import { useState } from 'react'
import FileUploader from './FileUploader'
import { triggerPdfExtraction } from '@/app/actions/extract-brand-pdf'
import ExtractionStatus from './ExtractionStatus'

export default function PdfUploadExtractor({ brandId }: { brandId: string }) {
  const [guidelineId, setGuidelineId] = useState<string | null>(null)

  async function handleUploadComplete(key: string) {
    const result = await triggerPdfExtraction(brandId, key)
    setGuidelineId(result.guidelineId)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Upload your brand guidelines PDF. We'll automatically extract colors, fonts, and tone of voice.
      </p>
      {!guidelineId ? (
        <FileUploader
          brandId={brandId}
          assetType="PDF_GUIDELINES"
          accept="application/pdf"
          label="Upload Brand Guidelines PDF (max 20MB)"
          onUploadComplete={handleUploadComplete}
        />
      ) : (
        <ExtractionStatus guidelineId={guidelineId} brandId={brandId} />
      )}
    </div>
  )
}
