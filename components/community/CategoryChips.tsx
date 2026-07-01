import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryChipsProps {
  categories: Category[]
  communitySlug?: string
  activeSlug?: string
}

export default function CategoryChips({ categories, communitySlug, activeSlug }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {categories.map((cat) => {
        const href = communitySlug ? `/c/${communitySlug}/${cat.slug}` : `/categories#${cat.slug}`
        const isActive = cat.slug === activeSlug
        return (
          <Link
            key={cat.id}
            href={href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border"
            style={
              isActive
                ? {
                    backgroundColor: 'var(--vouch-green)',
                    color: 'white',
                    borderColor: 'var(--vouch-green)',
                    boxShadow: '0 4px 12px rgba(32,178,107,0.3)',
                  }
                : { backgroundColor: 'white', color: 'var(--charcoal)', borderColor: 'var(--cloud-grey)' }
            }
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </Link>
        )
      })}
    </div>
  )
}
