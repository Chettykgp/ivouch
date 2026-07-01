import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--navy)' }} className="text-white/70 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-black text-white mb-2">
              i<span style={{ color: 'var(--vouch-green)' }}>Vouch</span>
            </div>
            <p className="text-sm leading-relaxed">
              Find local people your neighbours vouch for. South Africa&apos;s trusted community recommendation platform.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/add-business" className="hover:text-white transition-colors">Add Your Business</Link></li>
              <li><Link href="/auth" className="hover:text-white transition-colors">Sign In / Register</Link></li>
              <li><Link href="/guidelines" className="hover:text-white transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/guidelines" className="hover:text-white transition-colors">Vouch Guidelines</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-xs text-center">
          © {new Date().getFullYear()} iVouch (Pty) Ltd · South Africa · Powered by community trust
        </div>
      </div>
    </footer>
  )
}
