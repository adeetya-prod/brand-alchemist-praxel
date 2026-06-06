import { getCreativeWithKey } from '@/lib/db/creatives'
import CreativeViewer from '@/components/creatives/CreativeViewer'

export default async function CreativePage({ params }: { params: Promise<{ brandId: string; creativeId: string }> }) {
  const { brandId, creativeId } = await params
  const creative = await getCreativeWithKey(creativeId)
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Creative</h2>
      <CreativeViewer
        creativeId={creativeId}
        brandId={brandId}
        initialStatus={creative.status}
        initialUrl={creative.url ?? null}
        format={creative.format}
        prompt={creative.prompt}
        editedPrompt={creative.editedPrompt}
      />
    </div>
  )
}
