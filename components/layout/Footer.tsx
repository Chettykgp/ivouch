import Link from 'next/link'
import { MapPin } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="mt-20" style={{ backgroundColor: 'var(--ink)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo href="/" textClassName="text-white" markInk="#FFFFFF" />
            <p className="text-sm leading-relaxed text-white/60 mt-4 max-w-sm">
              Find people your neighbours vouch for. Real recommendations from real
              neighbours — no paid reviews, ever.
            </p>
            <div className="inline-flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>
              <MapPin size={13} style={{ color: 'var(--ivouch-blue)' }} />
              JHB South · Ward 23
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="/categories" className="hover:text-white transition-colors">Browse Categories</Link></li>
              <li><Link href="/c/jhb-south-ward-23" className="hover:text-white transition-colors">My Community</Link></li>
              <li><Link href="/add-business" className="hover:text-white transition-colors">Add Your Business</Link></li>
              <li><Link href="/auth" className="hover:text-white transition-colors">Log in / Sign up</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Trust &amp; Legal</h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="/guidelines" className="hover:text-white transition-colors">Community Guidelines</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        {/* Maker's mark */}
        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col items-center gap-3">
          <a
            href="https://kaidesigns.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span>Built by</span>
            <span className="font-extrabold group-hover:underline" style={{ color: 'var(--ivouch-blue)' }}>
              Kai&nbsp;Designs
            </span>
            <span className="inline-flex items-center gap-1">
              with <span aria-hidden style={{ color: 'var(--coral)' }}>❤</span> for the
            </span>
            <span className="font-bold text-white">Ward&nbsp;23 community</span>
          </a>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} iVouch · South Africa · Powered by community trust
          </p>
        </div>
      </div>
    </footer>
  )
}
