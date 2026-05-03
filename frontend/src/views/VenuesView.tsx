import { useEffect, useState } from 'react'

import { deleteJson, fetchJson, postJson, putJson } from '../lib/api'

type VenueRow = {
  id: number
  name: string
  city: string | null
  country: string | null
  capacity: number | null
}

type VenueFormValues = {
  name: string
  city: string
  country: string
  capacity: string
}

const initialFormValues: VenueFormValues = {
  name: '',
  city: '',
  country: '',
  capacity: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none'

export function VenuesView() {
  const [venues, setVenues] = useState<VenueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [editingVenueId, setEditingVenueId] = useState<number | null>(null)
  const [deletingVenueId, setDeletingVenueId] = useState<number | null>(null)
  const [formValues, setFormValues] = useState<VenueFormValues>(initialFormValues)

  useEffect(() => {
    let isMounted = true

    async function loadVenues() {
      setLoading(true)
      setError(null)

      try {
        const venueData = await fetchJson<VenueRow[]>('/venues')
        if (isMounted) {
          setVenues(venueData)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load venues')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadVenues()

    return () => {
      isMounted = false
    }
  }, [reloadCount])

  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredVenues = normalizedSearch
    ? venues.filter((venue) =>
        [venue.id, venue.name, venue.city, venue.country, venue.capacity].some((value) =>
          String(value ?? '').toLowerCase().includes(normalizedSearch),
        ),
      )
    : venues

  function updateFormField(field: keyof VenueFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  function resetForm() {
    setFormValues(initialFormValues)
    setEditingVenueId(null)
  }

  function handleEditVenue(venue: VenueRow) {
    setEditingVenueId(venue.id)
    setCreateError(null)
    setCreateSuccess(null)
    setFormValues({
      name: venue.name,
      city: venue.city || '',
      country: venue.country || '',
      capacity: venue.capacity === null ? '' : String(venue.capacity),
    })
  }

  async function handleSubmitVenue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(true)

    try {
      const payload = {
        name: formValues.name,
        city: formValues.city,
        country: formValues.country,
        capacity: Number(formValues.capacity),
      }

      if (editingVenueId) {
        await putJson(`/venues/${editingVenueId}`, payload)
      } else {
        await postJson('/venues', payload)
      }

      resetForm()
      setCreateSuccess(editingVenueId ? 'Venue updated successfully.' : 'Venue added successfully.')
      setReloadCount((count) => count + 1)
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Could not save venue')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteVenue(venueId: number) {
    setDeletingVenueId(venueId)
    setError(null)

    try {
      await deleteJson(`/venues/${venueId}`)
      setVenues((current) => current.filter((venue) => venue.id !== venueId))
      if (editingVenueId === venueId) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete venue')
    } finally {
      setDeletingVenueId(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Venues</h2>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search venues"
            className={inputClass}
          />
        </label>
      </div>

      <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">{editingVenueId ? 'Edit Venue' : 'Add Venue'}</h3>
        <form onSubmit={handleSubmitVenue} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-200">
            Venue Name
            <input
              value={formValues.name}
              required
              onChange={(event) => updateFormField('name', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            City
            <input
              value={formValues.city}
              required
              onChange={(event) => updateFormField('city', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Country
            <input
              value={formValues.country}
              required
              onChange={(event) => updateFormField('country', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Capacity
            <input
              type="number"
              min="0"
              value={formValues.capacity}
              required
              onChange={(event) => updateFormField('capacity', event.target.value)}
              className={inputClass}
            />
          </label>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Saving...' : editingVenueId ? 'Save Venue' : 'Add Venue'}
            </button>
            {editingVenueId ? (
              <button
                type="button"
                onClick={resetForm}
                className="ml-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Cancel Edit
              </button>
            ) : null}
            {createError ? <p className="mt-2 text-sm text-red-300">{createError}</p> : null}
            {createSuccess ? <p className="mt-2 text-sm text-emerald-300">{createSuccess}</p> : null}
          </div>
        </form>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-slate-300">Loading venues...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load venues: {error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-800/60">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    ID
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Name
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    City
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Country
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Capacity
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredVenues.map((venue) => (
                  <tr key={venue.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{venue.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{venue.name}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {venue.city || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {venue.country || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {venue.capacity === null ? 'N/A' : venue.capacity.toLocaleString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditVenue(venue)}
                          className="rounded-lg border border-amber-300/40 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/15"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingVenueId === venue.id}
                          onClick={() => handleDeleteVenue(venue.id)}
                          className="rounded-lg border border-red-300/40 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingVenueId === venue.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredVenues.length} of {venues.length} venues
          </p>
        </>
      )}
    </section>
  )
}
