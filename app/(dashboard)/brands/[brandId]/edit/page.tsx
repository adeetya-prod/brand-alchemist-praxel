import { getBrand } from '@/lib/db/brands'
import BrandEditForm from '@/components/brand/BrandEditForm'
import { redirect } from 'next/navigation'

export default async function EditBrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  let brand
  try {
    brand = await getBrand(brandId)
  } catch {
    redirect('/brands')
  }
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Brand</h2>
      <BrandEditForm brand={brand!} />
    </div>
  )
}
