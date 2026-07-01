interface VouchTagsProps {
  tags: string[]
}

export default function VouchTags({ tags }: VouchTagsProps) {
  if (!tags || tags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: 'var(--vouch-green)' }}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
