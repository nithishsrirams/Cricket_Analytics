import { useEffect, useMemo, useState } from 'react'

import { fetchJson, postJson } from '../lib/api'

type BowlingRow = {
  id: number
  match_id: number
  player_id: number
  overs: number
  wickets: number
  runs_conceded: number
  extras: number
}

type MatchRow = {
  id: number
  match_date: string
  format: string | null
  home_team_id: number
  away_team_id: number
}

type PlayerRow = {
  id: number
  name: string
}

type TeamRow = {
  id: number
  name: string
}

type BowlingFormValues = {
  match_id: string
  player_id: string
  overs: string
  wickets: string
  runs_conceded: string
  extras: string
}

const initialFormValues: BowlingFormValues = {
  match_id: '',
  player_id: '',
  overs: '',
  wickets: '',
  runs_conceded: '',
  extras: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none'

const selectClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none'

export function BowlingStatsView() {
  const [bowlingStats, setBowlingStats] = useState<BowlingRow[]>([])
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<BowlingFormValues>(initialFormValues)

  useEffect(() => {
    let isMounted = true

    async function loadBowlingData() {
      setLoading(true)
      setError(null)

      try {
        const [bowlingData, matchData, playerData, teamData] = await Promise.all([
          fetchJson<BowlingRow[]>('/bowling_stats'),
          fetchJson<MatchRow[]>('/matches'),
          fetchJson<PlayerRow[]>('/players'),
          fetchJson<TeamRow[]>('/teams'),
        ])

        if (isMounted) {
          setBowlingStats(bowlingData)
          setMatches(matchData)
          setPlayers(playerData)
          setTeams(teamData)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load bowling stats')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadBowlingData()

    return () => {
      isMounted = false
    }
  }, [reloadCount])

  const matchById = useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches])
  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams])

  function getTeamLabel(teamId: number) {
    return teamById.get(teamId)?.name || `Team ${teamId}`
  }

  function getMatchLabel(matchId: number) {
    const match = matchById.get(matchId)
    if (!match) {
      return `Match ${matchId}`
    }

    const matchup = `${getTeamLabel(match.home_team_id)} vs ${getTeamLabel(match.away_team_id)}`
    return [match.match_date, match.format, matchup].filter(Boolean).join(' - ')
  }

  function getPlayerLabel(playerId: number) {
    return playerById.get(playerId)?.name || `Player ${playerId}`
  }

  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredBowlingStats = normalizedSearch
    ? bowlingStats.filter((stat) =>
        [
          stat.id,
          getMatchLabel(stat.match_id),
          getPlayerLabel(stat.player_id),
          stat.overs,
          stat.wickets,
          stat.runs_conceded,
          stat.extras,
        ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch)),
      )
    : bowlingStats

  function updateFormField(field: keyof BowlingFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  async function handleCreateBowlingStat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(true)

    try {
      await postJson('/bowling_stats', {
        match_id: Number(formValues.match_id),
        player_id: Number(formValues.player_id),
        overs: Number(formValues.overs),
        wickets: Number(formValues.wickets),
        runs_conceded: Number(formValues.runs_conceded),
        extras: Number(formValues.extras),
      })

      setFormValues(initialFormValues)
      setCreateSuccess('Bowling stat added successfully.')
      setReloadCount((count) => count + 1)
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Could not add bowling stat')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Bowling Stats</h2>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search bowling stats"
            className={inputClass}
          />
        </label>
      </div>

      <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">Add Bowling Stat</h3>
        <form onSubmit={handleCreateBowlingStat} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-200">
            Match
            <select
              value={formValues.match_id}
              required
              onChange={(event) => updateFormField('match_id', event.target.value)}
              className={selectClass}
            >
              <option value="">Select match</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {getMatchLabel(match.id)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Player
            <select
              value={formValues.player_id}
              required
              onChange={(event) => updateFormField('player_id', event.target.value)}
              className={selectClass}
            >
              <option value="">Select player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Overs
            <input
              type="number"
              min="0"
              step="0.1"
              value={formValues.overs}
              required
              onChange={(event) => updateFormField('overs', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Wickets
            <input
              type="number"
              min="0"
              value={formValues.wickets}
              required
              onChange={(event) => updateFormField('wickets', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Runs Conceded
            <input
              type="number"
              min="0"
              value={formValues.runs_conceded}
              required
              onChange={(event) => updateFormField('runs_conceded', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Extras
            <input
              type="number"
              min="0"
              value={formValues.extras}
              required
              onChange={(event) => updateFormField('extras', event.target.value)}
              className={inputClass}
            />
          </label>

          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Adding...' : 'Add Bowling Stat'}
            </button>
          </div>

          {createError ? <p className="sm:col-span-2 lg:col-span-4 text-sm text-red-300">{createError}</p> : null}
          {createSuccess ? (
            <p className="sm:col-span-2 lg:col-span-4 text-sm text-emerald-300">{createSuccess}</p>
          ) : null}
        </form>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-slate-300">Loading bowling stats...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load bowling stats: {error}</p>
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
                    Match
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Player
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Overs
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Wickets
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Runs Conceded
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Extras
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredBowlingStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getMatchLabel(stat.match_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getPlayerLabel(stat.player_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.overs}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.wickets}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.runs_conceded}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.extras}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredBowlingStats.length} of {bowlingStats.length} bowling stats
          </p>
        </>
      )}
    </section>
  )
}
