import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Community Guidelines – iVouch' }

export default function GuidelinesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--charcoal)' }}>Community Guidelines</h1>
        <p className="text-gray-500 text-sm mb-8">iVouch is built on trust. These guidelines keep it that way.</p>

        <div className="space-y-6 text-gray-700 text-sm">
          {[
            {
              title: '✅ Only vouch for people you have actually used',
              body: 'A vouch means you personally recommend this business. Do not vouch for a friend or family member as a favour if you have not used their services.',
            },
            {
              title: '✅ Be honest',
              body: 'Write comments that reflect your genuine experience. Avoid exaggeration. If something went wrong, report it through the correct channel rather than a vouch.',
            },
            {
              title: '🚫 No fake accounts',
              body: 'Creating multiple accounts to boost vouch counts is strictly prohibited and will result in permanent bans.',
            },
            {
              title: '🚫 No defamation',
              body: 'Do not post false factual claims about a business or individual. Honest criticism based on your experience is welcome; defamation is not.',
            },
            {
              title: '🚫 No spam or advertising',
              body: 'Do not use iVouch to post unsolicited advertising or promotional content in vouch comments.',
            },
            {
              title: '🤝 Respect the community',
              body: 'iVouch serves diverse South African communities. Content that is racist, sexist, xenophobic, or otherwise discriminatory will be removed and the account banned.',
            },
            {
              title: '📢 Reporting',
              body: 'If you see content that violates these guidelines, use the Report button on the listing or vouch. Our team reviews all reports within 48 hours.',
            },
          ].map((item) => (
            <section key={item.title} className="rounded-xl p-5 border" style={{ borderColor: 'var(--cloud-grey)', backgroundColor: 'white' }}>
              <h2 className="font-bold mb-2" style={{ color: 'var(--charcoal)' }}>{item.title}</h2>
              <p>{item.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
