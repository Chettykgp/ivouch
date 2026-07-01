import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryChipsProps {
  categories: Category[]
  communitySlug?: string
  activeSlug?: string
}

export default function CategoryChips({ categories, communitySlug, activeSlug }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const href = communitySlug ? `/c/${communitySlug}/${cat.slug}` : `/?category=${cat.slug}`
        const isActive = cat.slug === activeSlug
        return (
          <Link key={cat.id} href={href}>
            <span
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer"
              style={
                isActive
                  ? { backgroundColor: 'var(--vouch-green)', color: 'white' }
                  : { backgroundColor: 'var(--cloud-grey)', color: 'var(--charcoal)' }
              }
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
