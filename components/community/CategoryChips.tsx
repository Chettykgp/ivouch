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
                    backgroundColor: 'var(--ivouch-blue)',
                    color: 'white',
                    borderColor: 'var(--ivouch-blue)',
                    boxShadow: 'var(--shadow-blue)',
                  }
                : { backgroundColor: 'white', color: 'var(--ink)', borderColor: 'var(--cloud-grey)' }
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
