import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur">
        <h1 className="text-xl font-bold text-indigo-600">Brand Alchemist</h1>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
          <Link href="/sign-up" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium">Get started free</Link>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Turn your brand identity into<br />
            <span className="text-indigo-600">scroll-stopping creatives</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
            Create brand guidelines, import existing ones from a PDF or website, then generate on-brand social media content in seconds.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up" className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-semibold text-lg">
              Start for free
            </Link>
            <Link href="/sign-in" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50 font-semibold text-lg">
              Sign in
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required</p>
        </div>
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl text-left">
          {[
            { icon: '🎨', title: 'Build your brand', desc: 'Step-by-step wizard to define colors, fonts, tone, and voice guidelines.' },
            { icon: '📄', title: 'Import guidelines', desc: 'Extract brand identity from existing PDFs, websites, or structured assets.' },
            { icon: '✨', title: 'Generate creatives', desc: 'AI-powered Instagram and LinkedIn visuals that match your brand perfectly.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
