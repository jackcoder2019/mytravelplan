'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAuthUser, redirectToLogin } from '@/lib/auth'
import { joinByToken, inviteByEmail } from '@/lib/api'
import { getCurrentUser } from 'aws-amplify/auth'

export default function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    getAuthUser().then(async user => {
      if (!user) {
        sessionStorage.setItem('join_token', token)
        redirectToLogin()
        return
      }
      // Check if we were redirected back after login with a stored token
      const stored = sessionStorage.getItem('join_token')
      const activeToken = stored ?? token
      sessionStorage.removeItem('join_token')

      const itineraryId = await joinByToken(activeToken)
      if (!itineraryId) { setStatus('error'); return }

      // Add current user's email to sharedWith
      const currentUser = await getCurrentUser()
      const email = currentUser.signInDetails?.loginId ?? currentUser.userId
      // Load current sharedWith and append
      await inviteByEmail(itineraryId, email, [])
      router.replace(`/itinerary?id=${itineraryId}`)
    })
  }, [token, router])

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-navy-mid rounded-xl p-8 text-center max-w-sm">
          <div className="text-accent-red text-4xl mb-4">✕</div>
          <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
          <p className="text-gray-400">This share link is invalid or has been revoked by the owner.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-accent-teal text-lg animate-pulse">Joining itinerary...</div>
    </div>
  )
}
