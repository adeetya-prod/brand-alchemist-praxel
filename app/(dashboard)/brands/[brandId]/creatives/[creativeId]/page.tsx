import { getCreativeWithKey } from '@/lib/db/creatives'
import CreativeViewer from '@/components/creatives/CreativeViewer'
import { redirect } from 'next/navigation'

export default async function CreativePage({ params }: { params: Promise<{ brandId: string; creativeId: string }> }) {
  const { brandId, creativeId } = await params
  let creative
  try {
    creative = await getCreativeWithKey(creativeId)
  } catch {
    redirect(`/brands/${brandId}/creatives`)
  }
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Creative</h2>
      <CreativeViewer
        creativeId={creativeId}
        brandId={brandId}
        initialStatus={creative!.status}
        initialUrl={creative!.url ?? null}
        format={creative!.format}
        prompt={creative!.prompt}
        editedPrompt={creative!.editedPrompt}
      />
    </div>
  )
}
