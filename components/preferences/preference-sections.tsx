'use client'

import { useState, useEffect, useRef, useActionState } from 'react'
import { TOPIC_CATEGORIES } from '@/lib/data/topics'
import {
  updatePreferences,
  updateTopics,
  updateSources,
  unsubscribeAction,
  resubscribeAction,
} from '@/app/actions/preferences'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PreferenceSectionsProps {
  subscriberId: string
  email: string
  currentTopics: string[]
  currentCustomTopics: string
  currentFormat: 'digest' | 'briefing' | 'mixed'
  currentDeliveryTime: 'morning' | 'afternoon' | 'evening'
  currentTimezone: string
  currentCity: string
  currentSmsOptIn: boolean
  currentPhone: string
  currentSources: string[]
  isUnsubscribed: boolean
}

type SaveStatus = 'idle' | 'pending' | 'success' | 'error'

// ---------------------------------------------------------------------------
// Save button component
// ---------------------------------------------------------------------------

function SaveButton({
  label,
  status,
  error,
  isPending,
  onClick,
}: {
  label: string
  status: SaveStatus
  error?: string
  isPending: boolean
  onClick?: () => void
}) {
  const displayStatus = isPending ? 'pending' : status

  return (
    <div>
      <button
        type="submit"
        disabled={displayStatus === 'pending'}
        onClick={onClick}
        className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
          displayStatus === 'success'
            ? 'bg-green-500 text-white'
            : displayStatus === 'pending'
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {displayStatus === 'pending' ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </span>
        ) : displayStatus === 'success' ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Saved
          </span>
        ) : (
          label
        )}
      </button>
      {error && displayStatus === 'error' && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PreferenceSections({
  subscriberId,
  email,
  currentTopics,
  currentCustomTopics,
  currentFormat,
  currentDeliveryTime,
  currentTimezone,
  currentCity,
  currentSmsOptIn,
  currentPhone,
  currentSources,
  isUnsubscribed: initialIsUnsubscribed,
}: PreferenceSectionsProps) {
  // ---- Topics state ----
  const [selectedTopics, setSelectedTopics] = useState<string[]>(currentTopics)
  const [customTopicsText, setCustomTopicsText] = useState(currentCustomTopics)
  const [topicStatus, setTopicStatus] = useState<SaveStatus>('idle')
  const topicsFormRef = useRef<HTMLFormElement>(null)

  const [topicsState, topicsFormAction, isTopicsPending] = useActionState(updateTopics, {})

  // ---- Preferences state (format, delivery, SMS) ----
  const [format, setFormat] = useState(currentFormat)
  const [deliveryTime, setDeliveryTime] = useState(currentDeliveryTime)
  const [city, setCity] = useState(currentCity)
  const [smsOptIn, setSmsOptIn] = useState(currentSmsOptIn)
  const [phone, setPhone] = useState(currentPhone)
  const [prefsStatus, setPrefsStatus] = useState<SaveStatus>('idle')
  const prefsFormRef = useRef<HTMLFormElement>(null)

  const [prefsState, prefsFormAction, isPrefsPending] = useActionState(updatePreferences, {})

  // ---- Sources state ----
  const [sourcesList, setSourcesList] = useState<string[]>(currentSources)
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [sourceError, setSourceError] = useState('')
  const [sourcesStatus, setSourcesStatus] = useState<SaveStatus>('idle')
  const sourcesFormRef = useRef<HTMLFormElement>(null)

  const [sourcesState, sourcesFormAction, isSourcesPending] = useActionState(updateSources, {})

  // ---- Unsubscribe/resubscribe state ----
  const [isUnsubscribed, setIsUnsubscribed] = useState(initialIsUnsubscribed)
  const unsubFormRef = useRef<HTMLFormElement>(null)
  const resubFormRef = useRef<HTMLFormElement>(null)

  const [unsubState, unsubFormAction, isUnsubPending] = useActionState(unsubscribeAction, {})
  const [resubState, resubFormAction, isResubPending] = useActionState(resubscribeAction, {})

  // ---- Effect: Handle topics action result ----
  useEffect(() => {
    if (topicsState.success) {
      setTopicStatus('success')
      const timer = setTimeout(() => setTopicStatus('idle'), 2000)
      return () => clearTimeout(timer)
    } else if (topicsState.error) {
      setTopicStatus('error')
    }
  }, [topicsState])

  // ---- Effect: Handle preferences action result ----
  useEffect(() => {
    if (prefsState.success) {
      setPrefsStatus('success')
      const timer = setTimeout(() => setPrefsStatus('idle'), 2000)
      return () => clearTimeout(timer)
    } else if (prefsState.error) {
      setPrefsStatus('error')
    }
  }, [prefsState])

  // ---- Effect: Handle sources action result ----
  useEffect(() => {
    if (sourcesState.success) {
      setSourcesStatus('success')
      const timer = setTimeout(() => setSourcesStatus('idle'), 2000)
      return () => clearTimeout(timer)
    } else if (sourcesState.error) {
      setSourcesStatus('error')
    }
  }, [sourcesState])

  // ---- Effect: Handle unsubscribe result ----
  useEffect(() => {
    if (unsubState.success) {
      setIsUnsubscribed(true)
    }
  }, [unsubState])

  // ---- Effect: Handle resubscribe result ----
  useEffect(() => {
    if (resubState.success) {
      setIsUnsubscribed(false)
    }
  }, [resubState])

  // ---- Topic toggle handler ----
  function toggleTopic(topicId: string) {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((t) => t !== topicId)
        : [...prev, topicId]
    )
  }

  // ---- Source management ----
  function addSource() {
    const url = newSourceUrl.trim()
    if (!url) return

    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setSourceError('URL must start with http:// or https://')
        return
      }
    } catch {
      setSourceError('Please enter a valid URL')
      return
    }

    if (sourcesList.includes(url)) {
      setSourceError('This source is already added')
      return
    }

    setSourcesList((prev) => [...prev, url])
    setNewSourceUrl('')
    setSourceError('')
  }

  function removeSource(url: string) {
    setSourcesList((prev) => prev.filter((s) => s !== url))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-slate-900">Your Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">{email}</p>
      </div>

      {/* Unsubscribed banner */}
      {isUnsubscribed && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">You&apos;re currently unsubscribed</p>
            <p className="text-sm text-amber-600 mt-0.5">You won&apos;t receive The Daily Briefing until you re-subscribe.</p>
          </div>
          <form ref={resubFormRef} action={resubFormAction}>
            <input type="hidden" name="subscriberId" value={subscriberId} />
            <button
              type="submit"
              disabled={isResubPending}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {isResubPending ? 'Re-subscribing...' : 'Re-subscribe'}
            </button>
          </form>
        </div>
      )}

      {/* Section 1: Topics */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Topics</h2>

        <div className="space-y-5">
          {TOPIC_CATEGORIES.map((category) => (
            <div key={category.id}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                {category.name}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.subtopics.map((subtopic) => (
                  <label
                    key={subtopic.id}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(subtopic.id)}
                      onChange={() => toggleTopic(subtopic.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20"
                    />
                    <span className="text-sm text-slate-700">{subtopic.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Custom topics
          </label>
          <textarea
            value={customTopicsText}
            onChange={(e) => setCustomTopicsText(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Describe any additional topics you'd like covered..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
          <p className="mt-1 text-xs text-slate-400">{customTopicsText.length}/500</p>
        </div>

        <div className="mt-4 flex justify-end">
          <form ref={topicsFormRef} action={topicsFormAction}>
            <input
              type="hidden"
              name="topicsData"
              value={JSON.stringify({
                subscriberId,
                topics: selectedTopics,
                customTopics: customTopicsText,
              })}
            />
            <SaveButton
              label="Save Topics"
              status={topicStatus}
              error={topicsState.error}
              isPending={isTopicsPending}
            />
          </form>
        </div>
      </div>

      {/* Section 2: Format, Delivery & SMS */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Format, Delivery & SMS</h2>

        {/* Format */}
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-700 mb-2">Newsletter format</p>
          <div className="space-y-2">
            {([
              { value: 'digest' as const, label: 'Curated Digest', desc: 'A quick scan of the best links with summaries' },
              { value: 'briefing' as const, label: 'Written Briefing', desc: 'An in-depth written analysis of your topics' },
              { value: 'mixed' as const, label: 'Mixed Format', desc: 'Written analysis plus curated links' },
            ]).map((option) => (
              <label
                key={option.value}
                className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={format === option.value}
                  onChange={() => setFormat(option.value)}
                  className="mt-0.5 h-4 w-4 border-slate-300 text-blue-500 focus:ring-blue-500/20"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">{option.label}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery time */}
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-700 mb-2">Delivery time</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'morning' as const, label: 'Morning (6 AM)' },
              { value: 'afternoon' as const, label: 'Afternoon (12 PM)' },
              { value: 'evening' as const, label: 'Evening (6 PM)' },
            ]).map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm ${
                  deliveryTime === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryTime"
                  value={option.value}
                  checked={deliveryTime === option.value}
                  onChange={() => setDeliveryTime(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Location (for local content)
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={100}
            placeholder="e.g., San Francisco, CA"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* SMS */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">SMS Notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">Receive a text summary of your daily report</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={smsOptIn}
              onClick={() => setSmsOptIn((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                smsOptIn ? 'bg-blue-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  smsOptIn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {smsOptIn && (
            <div className="mt-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-slate-400">Enter your phone number in international format</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <form ref={prefsFormRef} action={prefsFormAction}>
            <input
              type="hidden"
              name="preferencesData"
              value={JSON.stringify({
                subscriberId,
                format,
                deliveryTime,
                timezone: currentTimezone,
                city,
                smsOptIn,
                phone,
              })}
            />
            <SaveButton
              label="Save Settings"
              status={prefsStatus}
              error={prefsState.error}
              isPending={isPrefsPending}
            />
          </form>
        </div>
      </div>

      {/* Section 3: Custom Sources */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Custom Sources</h2>
        <p className="text-sm text-slate-500 mb-4">
          Add RSS or Atom feed URLs to include content from your favorite sources.
        </p>

        {/* Current sources list */}
        {sourcesList.length > 0 && (
          <div className="mb-4 space-y-2">
            {sourcesList.map((url) => (
              <div
                key={url}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <span className="text-sm text-slate-700 truncate mr-3">{url}</span>
                <button
                  type="button"
                  onClick={() => removeSource(url)}
                  className="shrink-0 rounded p-1 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label={`Remove ${url}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add source */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newSourceUrl}
            onChange={(e) => {
              setNewSourceUrl(e.target.value)
              setSourceError('')
            }}
            placeholder="https://example.com/feed.xml"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSource()
              }
            }}
          />
          <button
            type="button"
            onClick={addSource}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Add
          </button>
        </div>
        {sourceError && (
          <p className="mt-1.5 text-sm text-red-600">{sourceError}</p>
        )}

        <div className="mt-4 flex justify-end">
          <form ref={sourcesFormRef} action={sourcesFormAction}>
            <input
              type="hidden"
              name="sourcesData"
              value={JSON.stringify({
                subscriberId,
                feedUrls: sourcesList,
              })}
            />
            <SaveButton
              label="Save Sources"
              status={sourcesStatus}
              error={sourcesState.error}
              isPending={isSourcesPending}
            />
          </form>
        </div>
      </div>

      {/* Section 4: Danger Zone - Unsubscribe */}
      {!isUnsubscribed && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Unsubscribe</h2>
          <p className="text-sm text-red-600 mb-4">
            You will stop receiving The Daily Briefing. This is immediate.
          </p>
          <form ref={unsubFormRef} action={unsubFormAction}>
            <input type="hidden" name="subscriberId" value={subscriberId} />
            <button
              type="submit"
              disabled={isUnsubPending}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isUnsubPending ? 'Unsubscribing...' : 'Unsubscribe'}
            </button>
          </form>
        </div>
      )}

      {/* After unsubscribe: confirmation + re-subscribe */}
      {isUnsubscribed && !initialIsUnsubscribed && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-900 mb-1">You&apos;ve been unsubscribed</p>
          <p className="text-sm text-slate-500 mb-4">You won&apos;t receive any more emails from The Daily Briefing.</p>
          <form ref={resubFormRef} action={resubFormAction} className="inline">
            <input type="hidden" name="subscriberId" value={subscriberId} />
            <button
              type="submit"
              disabled={isResubPending}
              className="text-sm font-medium text-blue-500 hover:text-blue-600 underline transition-colors disabled:opacity-50"
            >
              {isResubPending ? 'Re-subscribing...' : 'Changed your mind? Re-subscribe'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
