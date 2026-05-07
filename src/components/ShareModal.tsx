'use client'
import { useState } from 'react'
import { inviteByEmail, removeCollaborator, generateShareLink, revokeShareLink } from '@/lib/api'

interface Props {
  recordId: string
  sharedWith: string[]
  shareToken: string | null
  shareLinkEnabled: boolean
  onClose: () => void
  onSharedWithChange: (sw: string[]) => void
  onShareTokenChange: (t: string | null) => void
  onShareLinkEnabledChange: (v: boolean) => void
}

export default function ShareModal({
  recordId, sharedWith, shareToken, shareLinkEnabled,
  onClose, onSharedWithChange, onShareTokenChange, onShareLinkEnabledChange,
}: Props) {
  const [tab, setTab] = useState<'invite' | 'link'>('invite')
  const [email, setEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [linkUrl, setLinkUrl] = useState(
    shareLinkEnabled && shareToken ? `${window.location.origin}/join/${shareToken}` : ''
  )
  const [copied, setCopied] = useState(false)
  const [working, setWorking] = useState(false)

  const handleInvite = async () => {
    if (!email.trim()) return
    setWorking(true)
    setInviteStatus('')
    try {
      const updated = await inviteByEmail(recordId, email.trim(), sharedWith)
      onSharedWithChange(updated)
      setEmail('')
      setInviteStatus('Invited!')
    } catch {
      setInviteStatus('Failed to invite. Try again.')
    }
    setWorking(false)
  }

  const handleRemove = async (e: string) => {
    const updated = await removeCollaborator(recordId, e, sharedWith)
    onSharedWithChange(updated)
  }

  const handleGenerate = async () => {
    setWorking(true)
    const url = await generateShareLink(recordId)
    const token = url.split('/join/')[1]
    onShareTokenChange(token)
    onShareLinkEnabledChange(true)
    setLinkUrl(url)
    setWorking(false)
  }

  const handleRevoke = async () => {
    await revokeShareLink(recordId)
    onShareTokenChange(null)
    onShareLinkEnabledChange(false)
    setLinkUrl('')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-navy-mid rounded-2xl w-full max-w-md mx-4 p-5 md:p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Share Itinerary</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['invite', 'link'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm capitalize transition-colors ${tab === t ? 'bg-accent-teal/20 text-accent-teal' : 'text-gray-400 hover:text-white'}`}>
              {t === 'invite' ? 'Invite by Email' : 'Share Link'}
            </button>
          ))}
        </div>

        {tab === 'invite' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                className="editable flex-1 px-3 py-2 rounded-lg bg-navy-light text-sm"
                placeholder="colleague@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
              />
              <button onClick={handleInvite} disabled={working}
                className="px-4 py-2 bg-accent-red hover:bg-red-700 rounded-lg text-sm disabled:opacity-50 transition-colors">
                Invite
              </button>
            </div>
            {inviteStatus && <p className="text-sm text-accent-teal mb-3">{inviteStatus}</p>}
            {sharedWith.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Collaborators</p>
                {sharedWith.map(e => (
                  <div key={e} className="flex items-center justify-between py-1.5 border-b border-navy-light">
                    <span className="text-sm">{e}</span>
                    <button onClick={() => handleRemove(e)} className="text-xs text-gray-500 hover:text-accent-red transition-colors">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'link' && (
          <div>
            {linkUrl ? (
              <>
                <div className="flex gap-2 mb-3">
                  <input readOnly className="flex-1 bg-navy-light rounded-lg px-3 py-2 text-sm text-gray-300 truncate" value={linkUrl} />
                  <button onClick={handleCopy} className="px-4 py-2 bg-navy-light hover:bg-navy-deep rounded-lg text-sm transition-colors">
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <button onClick={handleRevoke} className="text-sm text-gray-500 hover:text-accent-red transition-colors">
                  Revoke link
                </button>
              </>
            ) : (
              <button onClick={handleGenerate} disabled={working}
                className="w-full py-2 bg-accent-red hover:bg-red-700 rounded-lg text-sm disabled:opacity-50 transition-colors">
                {working ? 'Generating…' : 'Generate Share Link'}
              </button>
            )}
            <p className="text-xs text-gray-500 mt-3">Anyone with this link can join and edit the itinerary after logging in.</p>
          </div>
        )}
      </div>
    </div>
  )
}
