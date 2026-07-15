import Image from 'next/image'

interface BusinessGalleryProps {
  images: string[] | null | undefined
  businessName: string
}

/** Up to 2 business photos shown as a responsive grid; click to view full-size. */
export default function BusinessGallery({ images, businessName }: BusinessGalleryProps) {
  const photos = (images ?? []).filter(Boolean).slice(0, 2)
  if (photos.length === 0) return null

  return (
    <div className="card-soft p-3">
      <div className={`grid gap-2 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {photos.map((url, i) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block rounded-xl overflow-hidden aspect-[4/3] bg-[var(--mist)]"
          >
            <Image
              src={url}
              alt={`${businessName} photo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform hover:scale-[1.03]"
            />
          </a>
        ))}
      </div>
    </div>
  )
}
