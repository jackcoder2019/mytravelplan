'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { postFeedback, listFeedback, deleteFeedback, type FeedbackItem } from '@/lib/feedback'

export default function FeedbackPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [currentOwner, setCurrentOwner] = useState('')
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAuthUser()
      .then(async user => {
        if (!user) { router.replace('/'); return }
        setUserEmail((user as any).signInDetails?.loginId ?? '')
        setCurrentOwner((user as any).userId ?? '')
        try {
          const data = await listFeedback()
          setItems(data)
        } catch {
          // Feedback table may not be deployed yet — show empty state
        } finally {
          setLoading(false)
        }
      })
      .catch(() => router.replace('/'))
  }, [router])

  const handleSubmit = async () => {
    if (!comment.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const newItem = await postFeedback(comment.trim(), userEmail)
      setItems(prev => [newItem, ...prev])
      setComment('')
    } catch {
      setError('Failed to post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteFeedback(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-deep">
        <div className="text-accent-teal animate-pulse">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-deep text-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => window.close()} className="text-gray-400 hover:text-white text-sm transition-colors">← Close</button>
          <h1 className="text-2xl font-bold text-accent-teal">Feedback</h1>
        </div>

        {/* Post form */}
        <div className="bg-navy-mid rounded-2xl p-5 mb-6">
          <textarea
            className="w-full bg-navy-light rounded-xl p-3 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-1 focus:ring-accent-teal resize-none"
            rows={4}
            placeholder="Share a suggestion, report a bug, or leave a comment…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
          />
          {error && <p className="text-accent-red text-xs mt-2">{error}</p>}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">{userEmail}</span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !comment.trim()}
              className="px-5 py-1.5 rounded-lg bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal text-sm disabled:opacity-40 transition-colors"
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>

        {/* Comments list */}
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No feedback yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-navy-mid rounded-2xl p-4 group">
                <p className="text-sm text-gray-100 whitespace-pre-wrap">{item.comment}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">
                    {item.userEmail && <span className="mr-2">{item.userEmail}</span>}
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  {item.owner === currentOwner && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-gray-600 hover:text-accent-red opacity-0 group-hover:opacity-100 transition"
                    >Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
