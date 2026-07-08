export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-10" style={{ backgroundColor: 'var(--mist)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="skeleton h-10 w-2/3 max-w-md" />
        <div className="skeleton h-5 w-1/2 max-w-sm" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
