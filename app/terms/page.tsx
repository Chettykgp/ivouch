import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Terms of Service – iVouch' }

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--charcoal)' }}>Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: July 2025</p>

        <div className="space-y-6 text-gray-700 text-sm">
          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>1. Acceptance</h2>
            <p>By using iVouch, you agree to these terms. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>2. The Platform</h2>
            <p>iVouch is a community recommendation platform. We do not guarantee the quality or reliability of any business listed on the platform. Vouches represent the genuine opinions of community members and not those of iVouch.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>3. User Conduct</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must only vouch for businesses you have genuinely used</li>
              <li>You may not submit false, misleading, or defamatory content</li>
              <li>You may not create fake accounts or manipulate vouch counts</li>
              <li>You must be at least 18 years old to register</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>4. Business Listings</h2>
            <p>Business listings are community-sourced and subject to review. iVouch reserves the right to remove any listing that violates these terms or our community guidelines.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>5. Limitation of Liability</h2>
            <p>iVouch is provided &quot;as is&quot;. To the fullest extent permitted by South African law, iVouch is not liable for any damages arising from your use of the platform or reliance on any listing or vouch.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--charcoal)' }}>6. Governing Law</h2>
            <p>These terms are governed by the laws of the Republic of South Africa. Disputes shall be subject to the jurisdiction of the South African courts.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
