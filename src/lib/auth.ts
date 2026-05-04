'use client'
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'

export async function getAuthUser() {
  try {
    return await getCurrentUser()
  } catch {
    return null
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() ?? null
  } catch {
    return null
  }
}

export async function redirectToLogin() {
  await signIn({ provider: { custom: 'COGNITO' } } as never)
}

export async function handleSignOut() {
  await signOut()
  window.location.href = '/'
}
