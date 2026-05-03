import { useEffect, useMemo, useState } from 'react'

import { fetchJson, postJson } from '../lib/api'

type MatchRow = {
  id: number
  season_id: number
  venue_id: number
  match_date: string
  format: string | null
  home_team_id: number
  away_team_id: number
  winner_team_id: number | null
  toss_winner_team_id: number | null
}

type SeasonRow = {
  id: number
  year: number
  league: string | null
}

type VenueRow = {
  id: number
  name: string
  city: string | null
  country: string | null
}

type TeamRow = {
  id: number
  name: string
}

type MatchFormValues = {
  season_id: string
  venue_id: string
  match_date: string
  format: string
  home_team_id: string
  away_team_id: string
  winner_team_id: string
  toss_winner_team_id: string
}

const initialFormValues: MatchFormValues = {
  season_id: '',
  venue_id: '',
  match_date: '',
  format: '',
  home_team_id: '',
  away_team_id: '',
  winner_team_id: '',
  toss_winner_team_id: '',
}

const defaultFormatOptions = ['T20', 'ODI', 'Test']

const inputClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none'

const selectClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60'

export function MatchesView() {
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [venues, setVenues] = useState<VenueRow[]>([])
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<MatchFormValues>(initialFormValues)

  useEffect(() => {
    let isMounted = true

    async function loadMatchData() {
      setLoading(true)
      setError(null)

      try {
        const [matchData, seasonData, venueData, teamData] = await Promise.all([
          fetchJson<MatchRow[]>('/matches'),
          fetchJson<SeasonRow[]>('/seasons'),
          fetchJson<VenueRow[]>('/venues'),
          fetchJson<TeamRow[]>('/teams'),
        ])

        if (isMounted) {
          setMatches(matchData)
          setSeasons(seasonData)
          setVenues(venueData)
          setTeams(teamData)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load matches')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMatchData()

    return () => {
      isMounted = false
    }
  }, [reloadCount])

  const seasonById = useMemo(() => new Map(seasons.map((season) => [season.id, season])), [seasons])
  const venueById = useMemo(() => new Map(venues.map((venue) => [venue.id, venue])), [venues])
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams])

  const formatOptions = useMemo(() => {
    const seenFormats = new Set<string>()
    const databaseFormats = matches
      .map((match) => match.format?.trim())
      .filter((format): format is string => Boolean(format))
      .sort((a, b) => a.localeCompare(b))

    return [...defaultFormatOptions, ...databaseFormats].filter((format) => {
      const normalizedFormat = format.toLowerCase()
      if (seenFormats.has(normalizedFormat)) {
        return false
      }

      seenFormats.add(normalizedFormat)
      return true
    })
  }, [matches])

  function getSeasonLabel(seasonId: number) {
    const season = seasonById.get(seasonId)
    if (!season) {
      return `Season ${seasonId}`
    }

    return season.league ? `${season.year} - ${season.league}` : String(season.year)
  }

  function getVenueLabel(venueId: number) {
    const venue = venueById.get(venueId)
    if (!venue) {
      return `Venue ${venueId}`
    }

    return [venue.name, venue.city].filter(Boolean).join(', ')
  }

  function getTeamLabel(teamId: number | null | undefined) {
    if (teamId === null || teamId === undefined) {
      return 'TBD'
    }

    return teamById.get(teamId)?.name || `Team ${teamId}`
  }

  const selectedTeamChoices = [formValues.home_team_id, formValues.away_team_id]
    .filter((teamId, index, selectedIds): teamId is string => Boolean(teamId) && selectedIds.indexOf(teamId) === index)
    .map((teamId) => ({
      id: teamId,
      name: getTeamLabel(Number(teamId)),
    }))

  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredMatches = normalizedSearch
    ? matches.filter((match) =>
        [
          match.id,
          match.match_date,
          match.format,
          getSeasonLabel(match.season_id),
          getVenueLabel(match.venue_id),
          getTeamLabel(match.home_team_id),
          getTeamLabel(match.away_team_id),
          getTeamLabel(match.winner_team_id),
          getTeamLabel(match.toss_winner_team_id),
        ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch)),
      )
    : matches

  function updateFormField(field: keyof MatchFormValues, value: string) {
    setFormValues((current) => {
      const next = { ...current, [field]: value }

      if (field === 'home_team_id' || field === 'away_team_id') {
        const allowedTeamIds = new Set([next.home_team_id, next.away_team_id].filter(Boolean))

        if (next.winner_team_id && !allowedTeamIds.has(next.winner_team_id)) {
          next.winner_team_id = ''
        }

        if (next.toss_winner_team_id && !allowedTeamIds.has(next.toss_winner_team_id)) {
          next.toss_winner_team_id = ''
        }
      }

      return next
    })
  }

  async function handleCreateMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)

    if (formValues.home_team_id && formValues.home_team_id === formValues.away_team_id) {
      setCreateError('Home and away teams must be different.')
      return
    }

    setIsCreating(true)

    try {
      await postJson('/matches', {
        season_id: Number(formValues.season_id),
        venue_id: Number(formValues.venue_id),
        match_date: formValues.match_date,
        format: formValues.format,
        home_team_id: Number(formValues.home_team_id),
        away_team_id: Number(formValues.away_team_id),
        winner_team_id: formValues.winner_team_id ? Number(formValues.winner_team_id) : undefined,
        toss_winner_team_id: formValues.toss_winner_team_id ? Number(formValues.toss_winner_team_id) : undefined,
      })

      setFormValues(initialFormValues)
      setCreateSuccess('Match added successfully.')
      setReloadCount((count) => count + 1)
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Could not add match')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Matches</h2>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search matches"
            className={inputClass}
          />
        </label>
      </div>

      <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">Add Match</h3>
        <form onSubmit={handleCreateMatch} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-200">
            Season
            <select
              value={formValues.season_id}
              required
              onChange={(event) => updateFormField('season_id', event.target.value)}
              className={selectClass}
            >
              <option value="">Select season</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {getSeasonLabel(season.id)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Venue
            <select
              value={formValues.venue_id}
              required
              onChange={(event) => updateFormField('venue_id', event.target.value)}
              className={selectClass}
            >
              <option value="">Select venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {getVenueLabel(venue.id)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Match Date
            <input
              type="date"
              value={formValues.match_date}
              required
              onChange={(event) => updateFormField('match_date', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Format
            <select
              value={formValues.format}
              required
              onChange={(event) => updateFormField('format', event.target.value)}
              className={selectClass}
            >
              <option value="">Select format</option>
              {formatOptions.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Home Team
            <select
              value={formValues.home_team_id}
              required
              onChange={(event) => updateFormField('home_team_id', event.target.value)}
              className={selectClass}
            >
              <option value="">Select home team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id} disabled={String(team.id) === formValues.away_team_id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Away Team
            <select
              value={formValues.away_team_id}
              required
              onChange={(event) => updateFormField('away_team_id', event.target.value)}
              className={selectClass}
            >
              <option value="">Select away team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id} disabled={String(team.id) === formValues.home_team_id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Winner
            <select
              value={formValues.winner_team_id}
              disabled={selectedTeamChoices.length < 2}
              onChange={(event) => updateFormField('winner_team_id', event.target.value)}
              className={selectClass}
            >
              <option value="">TBD</option>
              {selectedTeamChoices.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Toss Winner
            <select
              value={formValues.toss_winner_team_id}
              disabled={selectedTeamChoices.length < 2}
              onChange={(event) => updateFormField('toss_winner_team_id', event.target.value)}
              className={selectClass}
            >
              <option value="">Select toss winner</option>
              {selectedTeamChoices.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Adding...' : 'Add Match'}
            </button>
          </div>

          {createError ? <p className="sm:col-span-2 lg:col-span-4 text-sm text-red-300">{createError}</p> : null}
          {createSuccess ? (
            <p className="sm:col-span-2 lg:col-span-4 text-sm text-emerald-300">{createSuccess}</p>
          ) : null}
        </form>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-slate-300">Loading matches...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load matches: {error}</p>
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
                    Date
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Format
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Season
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Venue
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Home
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Away
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Winner
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Toss Winner
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{match.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{match.match_date}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {match.format || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getSeasonLabel(match.season_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getVenueLabel(match.venue_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getTeamLabel(match.home_team_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getTeamLabel(match.away_team_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getTeamLabel(match.winner_team_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getTeamLabel(match.toss_winner_team_id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredMatches.length} of {matches.length} matches
          </p>
        </>
      )}
    </section>
  )
}
