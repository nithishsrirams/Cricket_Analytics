import { useEffect, useMemo, useState } from 'react'

import { deleteJson, fetchJson, postJson, putJson } from '../lib/api'

type TeamRow = {
  id: number
  name: string
  league: string | null
  home_venue_id: number | null
  owner: string | null
  coach: string | null
}

type VenueRow = {
  id: number
  name: string
  city: string | null
  country: string | null
}

type TeamFormValues = {
  name: string
  league: string
  home_venue_id: string
  owner: string
  coach: string
}

const initialFormValues: TeamFormValues = {
  name: '',
  league: '',
  home_venue_id: '',
  owner: '',
  coach: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none'

const selectClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none'

export function TeamsView() {
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [venues, setVenues] = useState<VenueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null)
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null)
  const [formValues, setFormValues] = useState<TeamFormValues>(initialFormValues)

  useEffect(() => {
    let isMounted = true

    async function loadTeamData() {
      setLoading(true)
      setError(null)

      try {
        const [teamData, venueData] = await Promise.all([
          fetchJson<TeamRow[]>('/teams'),
          fetchJson<VenueRow[]>('/venues'),
        ])

        if (isMounted) {
          setTeams(teamData)
          setVenues(venueData)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load teams')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadTeamData()

    return () => {
      isMounted = false
    }
  }, [reloadCount])

  const venueById = useMemo(() => new Map(venues.map((venue) => [venue.id, venue])), [venues])

  const leagueOptions = useMemo(() => {
    const leagues = new Set(
      teams
        .map((team) => team.league?.trim())
        .filter((league): league is string => Boolean(league)),
    )

    return Array.from(leagues).sort((a, b) => a.localeCompare(b))
  }, [teams])

  function getVenueLabel(venueId: number | null) {
    if (venueId === null) {
      return 'N/A'
    }

    const venue = venueById.get(venueId)
    if (!venue) {
      return `Venue ${venueId}`
    }

    return [venue.name, venue.city].filter(Boolean).join(', ')
  }

  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredTeams = normalizedSearch
    ? teams.filter((team) =>
        [
          team.id,
          team.name,
          team.league,
          getVenueLabel(team.home_venue_id),
          team.owner,
          team.coach,
        ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch)),
      )
    : teams

  function updateFormField(field: keyof TeamFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  function resetForm() {
    setFormValues(initialFormValues)
    setEditingTeamId(null)
  }

  function handleEditTeam(team: TeamRow) {
    setEditingTeamId(team.id)
    setCreateError(null)
    setCreateSuccess(null)
    setFormValues({
      name: team.name,
      league: team.league || '',
      home_venue_id: team.home_venue_id === null ? '' : String(team.home_venue_id),
      owner: team.owner || '',
      coach: team.coach || '',
    })
  }

  async function handleSubmitTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(true)

    try {
      const payload = {
        name: formValues.name,
        league: formValues.league,
        home_venue_id: formValues.home_venue_id ? Number(formValues.home_venue_id) : undefined,
        owner: formValues.owner || undefined,
        coach: formValues.coach || undefined,
      }

      if (editingTeamId) {
        await putJson(`/teams/${editingTeamId}`, payload)
      } else {
        await postJson('/teams', payload)
      }

      resetForm()
      setCreateSuccess(editingTeamId ? 'Team updated successfully.' : 'Team added successfully.')
      setReloadCount((count) => count + 1)
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Could not save team')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteTeam(teamId: number) {
    setDeletingTeamId(teamId)
    setError(null)

    try {
      await deleteJson(`/teams/${teamId}`)
      setTeams((current) => current.filter((team) => team.id !== teamId))
      if (editingTeamId === teamId) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete team')
    } finally {
      setDeletingTeamId(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Teams</h2>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search teams"
            className={inputClass}
          />
        </label>
      </div>

      <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">{editingTeamId ? 'Edit Team' : 'Add Team'}</h3>
        <form onSubmit={handleSubmitTeam} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-medium text-slate-200">
            Team Name
            <input
              value={formValues.name}
              required
              onChange={(event) => updateFormField('name', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            League
            <input
              list="team-league-options"
              value={formValues.league}
              required
              placeholder="Select or type league"
              onChange={(event) => updateFormField('league', event.target.value)}
              className={inputClass}
            />
            <datalist id="team-league-options">
              {leagueOptions.map((league) => (
                <option key={league} value={league} />
              ))}
            </datalist>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Home Venue
            <select
              value={formValues.home_venue_id}
              onChange={(event) => updateFormField('home_venue_id', event.target.value)}
              className={selectClass}
            >
              <option value="">No home venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {getVenueLabel(venue.id)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Owner
            <input
              value={formValues.owner}
              onChange={(event) => updateFormField('owner', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Coach
            <input
              value={formValues.coach}
              onChange={(event) => updateFormField('coach', event.target.value)}
              className={inputClass}
            />
          </label>

          <div className="sm:col-span-2 lg:col-span-5">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Saving...' : editingTeamId ? 'Save Team' : 'Add Team'}
            </button>
            {editingTeamId ? (
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
        <p className="p-6 text-sm text-slate-300">Loading teams...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load teams: {error}</p>
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
                    League
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Home Venue
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Owner
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Coach
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{team.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{team.name}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {team.league || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getVenueLabel(team.home_venue_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {team.owner || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {team.coach || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditTeam(team)}
                          className="rounded-lg border border-amber-300/40 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/15"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingTeamId === team.id}
                          onClick={() => handleDeleteTeam(team.id)}
                          className="rounded-lg border border-red-300/40 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingTeamId === team.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredTeams.length} of {teams.length} teams
          </p>
        </>
      )}
    </section>
  )
}
