import { NextRequest, NextResponse } from 'next/server'
import { getAssetBuffer } from '@/lib/storage'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/dal'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUser()
    const { id } = await params
    const format = request.nextUrl.searchParams.get('format') ?? 'jpg'

    if (!['jpg', 'png', 'webp'].includes(format)) {
      return new NextResponse('Invalid format', { status: 400 })
    }

    const creative = await prisma.creative.findFirst({
      where: { id, brand: { userId } },
      select: { key: true, status: true },
    })

    if (!creative) return new NextResponse('Not found', { status: 404 })
    if (creative.status !== 'COMPLETED' || !creative.key) {
      return new NextResponse('Creative not ready', { status: 409 })
    }

    const buffer = await getAssetBuffer(creative.key)

    let outputBuffer: Buffer
    let contentType: string

    if (format === 'jpg') {
      outputBuffer = buffer
      contentType = 'image/jpeg'
    } else {
      const sharp = (await import('sharp')).default
      if (format === 'png') {
        outputBuffer = await sharp(buffer).png().toBuffer()
        contentType = 'image/png'
      } else {
        outputBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer()
        contentType = 'image/webp'
      }
    }

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="creative-${id}.${format}"`,
        'Content-Length': String(outputBuffer.length),
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    console.error('[download-route]', err)
    return new NextResponse('Server error', { status: 500 })
  }
}
