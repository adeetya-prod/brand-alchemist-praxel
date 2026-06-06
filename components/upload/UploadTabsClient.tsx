'use client'
import { useState } from 'react'
import PdfUploadExtractor from './PdfUploadExtractor'
import WebsiteUrlExtractor from './WebsiteUrlExtractor'
import StructuredAssetUpload from './StructuredAssetUpload'

const TABS = ['PDF Upload', 'Website URL', 'Manual Entry']

export default function UploadTabsClient({ brandId }: { brandId: string }) {
  const [tab, setTab] = useState(0)
  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((label, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === i ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 0 && <PdfUploadExtractor brandId={brandId} />}
      {tab === 1 && <WebsiteUrlExtractor brandId={brandId} />}
      {tab === 2 && <StructuredAssetUpload brandId={brandId} />}
    </div>
  )
}
