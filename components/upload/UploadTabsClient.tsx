'use client'
import { useState } from 'react'
import PdfUploadExtractor from './PdfUploadExtractor'
import WebsiteUrlExtractor from './WebsiteUrlExtractor'
import StructuredAssetUpload from './StructuredAssetUpload'

const TABS = [
  { label: 'PDF Upload', icon: '📄' },
  { label: 'Website URL', icon: '🌐' },
  { label: 'Manual Entry', icon: '✏️' },
]

export default function UploadTabsClient({ brandId, initialTab = 0 }: { brandId: string; initialTab?: number }) {
  const [tab, setTab] = useState(initialTab)
  return (
    <div>
      <div
        className="flex gap-1 p-1 rounded-xl mb-6"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={tab === i
              ? { background: 'rgba(124,58,237,0.25)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.4)' }
              : { color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
            }
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        {tab === 0 && <PdfUploadExtractor brandId={brandId} />}
        {tab === 1 && <WebsiteUrlExtractor brandId={brandId} />}
        {tab === 2 && <StructuredAssetUpload brandId={brandId} />}
      </div>
    </div>
  )
}
