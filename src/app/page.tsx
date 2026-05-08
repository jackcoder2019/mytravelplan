'use client'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import type { AuthUser } from 'aws-amplify/auth'

function RedirectIfLoggedIn({ user }: { user?: AuthUser }) {
  const router = useRouter()
  useEffect(() => {
    if (user) router.replace('/itinerary')
  }, [user, router])
  return <div className="text-accent-teal text-lg animate-pulse">Loading...</div>
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <Authenticator>
        {({ user }) => <RedirectIfLoggedIn user={user} />}
      </Authenticator>
      <Link
        href="/itinerary?demo=true"
        className="text-sm text-gray-400 hover:text-accent-teal transition-colors underline underline-offset-4"
      >
        Try demo without signing in
      </Link>
    </div>
  )
}
