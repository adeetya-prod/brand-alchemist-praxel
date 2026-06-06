import Link from 'next/link'
import UploadTabsClient from '@/components/upload/UploadTabsClient'

export default async function UploadGuidelinesPage({
  searchParams,
}: {
  searchParams: Promise<{ brandId?: string }>
}) {
  const { brandId } = await searchParams
  if (!brandId) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Brand Guidelines</h2>
        <p className="text-gray-500 mb-4">
          First create a brand, then you can upload or import your existing guidelines.
        </p>
        <Link
          href="/brands/new"
          className="inline-block bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700"
        >
          Create Brand First
        </Link>
      </div>
    )
  }
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Brand Guidelines</h2>
      <p className="text-gray-500 mb-8">Choose how you want to import your existing brand identity.</p>
      <UploadTabsClient brandId={brandId} />
    </div>
  )
}
