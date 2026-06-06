import { getBrand } from '@/lib/db/brands'
import BrandEditForm from '@/components/brand/BrandEditForm'

export default async function EditBrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  const brand = await getBrand(brandId)
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Brand</h2>
      <BrandEditForm brand={brand} />
    </div>
  )
}
