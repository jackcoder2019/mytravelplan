'use client'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AuthUser } from 'aws-amplify/auth'

function RedirectIfLoggedIn({ user }: { user?: AuthUser }) {
  const router = useRouter()
  useEffect(() => {
    if (user) router.replace('/itinerary')
  }, [user, router])
  return <div className="text-accent-teal text-lg animate-pulse">Loading…</div>
}

const features = [
  {
    icon: '🗺',
    title: 'Day-by-day planning',
    desc: 'Organize activities, dining, lodging, and transport for every day of your trip on an interactive map.',
  },
  {
    icon: '🌤',
    title: 'Auto weather',
    desc: 'Enter a city and date — weather conditions and temperatures fill in automatically from live forecasts.',
  },
  {
    icon: '✈',
    title: 'Flight reminders',
    desc: 'Schedule an email reminder for any transport entry so you never miss a departure.',
  },
]

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signUp')

  return (
    <div className="min-h-screen bg-navy-deep text-gray-100 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-3 text-5xl">🌍</div>
        <h1 className="text-4xl md:text-5xl font-bold text-accent-teal mb-3 tracking-tight">
          My Travel Plan
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10">
          Plan every day of your trip — maps, weather, flights, and reminders — all in one place.
        </p>

        {/* CTAs */}
        {!showAuth && (
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <button
              onClick={() => { setAuthMode('signUp'); setShowAuth(true) }}
              className="px-8 py-3 rounded-xl bg-accent-teal text-navy-deep font-semibold text-base hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
            <button
              onClick={() => { setAuthMode('signIn'); setShowAuth(true) }}
              className="px-8 py-3 rounded-xl bg-navy-mid border border-navy-light text-gray-200 text-base hover:border-accent-teal hover:text-accent-teal transition-colors"
            >
              Log In
            </button>
            <Link
              href="/itinerary?demo=true"
              className="px-8 py-3 rounded-xl border border-navy-light text-gray-400 text-base hover:border-accent-teal hover:text-accent-teal transition-colors"
            >
              Try Demo
            </Link>
          </div>
        )}

        {/* Auth form */}
        {showAuth && (
          <div className="w-full max-w-sm mb-10">
            <Authenticator initialState={authMode}>
              {({ user }) => <RedirectIfLoggedIn user={user} />}
            </Authenticator>
            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          {features.map(f => (
            <div key={f.title} className="bg-navy-mid rounded-2xl p-5 text-left">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-accent-teal mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-600">
        {!showAuth && (
          <button onClick={() => { setAuthMode('signIn'); setShowAuth(true) }} className="hover:text-gray-400 transition-colors">
            Sign in
          </button>
        )}
      </div>
    </div>
  )
}
