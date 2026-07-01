interface VouchCountProps {
  count: number
  businessName?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function VouchCount({ count, businessName, size = 'md' }: VouchCountProps) {
  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-black',
    lg: 'text-4xl font-black',
  }

  return (
    <div className="text-center">
      <div style={{ color: 'var(--vouch-green)' }} className={sizeClasses[size]}>
        {count.toLocaleString()} neighbours vouch {businessName ? `for ${businessName}` : 'for this business'}
      </div>
    </div>
  )
}
