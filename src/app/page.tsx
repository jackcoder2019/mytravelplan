'use client'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
    <div className="flex items-center justify-center min-h-screen">
      <Authenticator>
        {({ user }) => <RedirectIfLoggedIn user={user} />}
      </Authenticator>
    </div>
  )
}
