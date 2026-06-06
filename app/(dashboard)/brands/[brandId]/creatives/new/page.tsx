import { getBrand } from '@/lib/db/brands'
import CreativeRequestForm from '@/components/creatives/CreativeRequestForm'

export default async function NewCreativePage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  const brand = await getBrand(brandId)
  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Creative</h2>
      <p className="text-gray-500 mb-8">Create an on-brand social media graphic for {brand.name}.</p>
      <CreativeRequestForm brandId={brandId} brandName={brand.name} />
    </div>
  )
}
