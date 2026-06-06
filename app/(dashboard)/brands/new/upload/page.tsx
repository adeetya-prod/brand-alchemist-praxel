import Link from 'next/link'
import UploadTabsClient from '@/components/upload/UploadTabsClient'

export default async function UploadGuidelinesPage({
  searchParams,
}: {
  searchParams: Promise<{ brandId?: string; tab?: string }>
}) {
  const { brandId, tab } = await searchParams
  const initialTab = tab ? parseInt(tab, 10) : 0

  if (!brandId) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-4xl mb-6">🧪</p>
        <h2 className="text-2xl font-bold text-white mb-3">Create a brand first</h2>
        <p className="text-white/50 mb-8">You need a brand space before you can import guidelines.</p>
        <Link
          href="/brands/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
        >
          Create Brand Space
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/brands" className="flex items-center gap-2 text-sm text-white/45 hover:text-white/80 mb-8 transition-colors">
        ← Brand Spaces
      </Link>
      <h2 className="text-2xl font-bold text-white mb-2">Import Brand Guidelines</h2>
      <p className="text-white/50 mb-8">Choose how you want to import your existing brand identity.</p>
      <UploadTabsClient brandId={brandId} initialTab={initialTab} />
    </div>
  )
}
