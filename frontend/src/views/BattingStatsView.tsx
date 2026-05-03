import { useEffect, useMemo, useState } from 'react'

import { deleteJson, fetchJson, postJson, putJson } from '../lib/api'

type BattingRow = {
  id: number
  match_id: number
  player_id: number
  runs: number
  balls: number
  fours: number
  sixes: number
  not_out: boolean
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

type BattingFormValues = {
  match_id: string
  player_id: string
  runs: string
  balls_faced: string
  fours: string
  sixes: string
  not_out: string
}

const initialFormValues: BattingFormValues = {
  match_id: '',
  player_id: '',
  runs: '',
  balls_faced: '',
  fours: '',
  sixes: '',
  not_out: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none'

const selectClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none'

export function BattingStatsView() {
  const [battingStats, setBattingStats] = useState<BattingRow[]>([])
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
  const [editingBattingStatId, setEditingBattingStatId] = useState<number | null>(null)
  const [deletingBattingStatId, setDeletingBattingStatId] = useState<number | null>(null)
  const [formValues, setFormValues] = useState<BattingFormValues>(initialFormValues)

  useEffect(() => {
    let isMounted = true

    async function loadBattingData() {
      setLoading(true)
      setError(null)

      try {
        const [battingData, matchData, playerData, teamData] = await Promise.all([
          fetchJson<BattingRow[]>('/batting_stats'),
          fetchJson<MatchRow[]>('/matches'),
          fetchJson<PlayerRow[]>('/players'),
          fetchJson<TeamRow[]>('/teams'),
        ])

        if (isMounted) {
          setBattingStats(battingData)
          setMatches(matchData)
          setPlayers(playerData)
          setTeams(teamData)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load batting stats')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadBattingData()

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
  const filteredBattingStats = normalizedSearch
    ? battingStats.filter((stat) =>
        [
          stat.id,
          getMatchLabel(stat.match_id),
          getPlayerLabel(stat.player_id),
          stat.runs,
          stat.balls,
          stat.fours,
          stat.sixes,
          stat.not_out ? 'Yes' : 'No',
        ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch)),
      )
    : battingStats

  function updateFormField(field: keyof BattingFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  function resetForm() {
    setFormValues(initialFormValues)
    setEditingBattingStatId(null)
  }

  function handleEditBattingStat(stat: BattingRow) {
    setEditingBattingStatId(stat.id)
    setCreateError(null)
    setCreateSuccess(null)
    setFormValues({
      match_id: String(stat.match_id),
      player_id: String(stat.player_id),
      runs: String(stat.runs),
      balls_faced: String(stat.balls),
      fours: String(stat.fours),
      sixes: String(stat.sixes),
      not_out: stat.not_out ? 'true' : 'false',
    })
  }

  async function handleSubmitBattingStat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(true)

    try {
      const payload = {
        match_id: Number(formValues.match_id),
        player_id: Number(formValues.player_id),
        runs: Number(formValues.runs),
        balls_faced: Number(formValues.balls_faced),
        fours: Number(formValues.fours),
        sixes: Number(formValues.sixes),
        not_out: formValues.not_out === 'true',
      }

      if (editingBattingStatId) {
        await putJson(`/batting_stats/${editingBattingStatId}`, payload)
      } else {
        await postJson('/batting_stats', payload)
      }

      resetForm()
      setCreateSuccess(editingBattingStatId ? 'Batting stat updated successfully.' : 'Batting stat added successfully.')
      setReloadCount((count) => count + 1)
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Could not save batting stat')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteBattingStat(statId: number) {
    setDeletingBattingStatId(statId)
    setError(null)

    try {
      await deleteJson(`/batting_stats/${statId}`)
      setBattingStats((current) => current.filter((stat) => stat.id !== statId))
      if (editingBattingStatId === statId) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete batting stat')
    } finally {
      setDeletingBattingStatId(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Batting Stats</h2>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search batting stats"
            className={inputClass}
          />
        </label>
      </div>

      <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">
          {editingBattingStatId ? 'Edit Batting Stat' : 'Add Batting Stat'}
        </h3>
        <form onSubmit={handleSubmitBattingStat} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            Runs
            <input
              type="number"
              min="0"
              value={formValues.runs}
              required
              onChange={(event) => updateFormField('runs', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Balls Faced
            <input
              type="number"
              min="0"
              value={formValues.balls_faced}
              required
              onChange={(event) => updateFormField('balls_faced', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Fours
            <input
              type="number"
              min="0"
              value={formValues.fours}
              required
              onChange={(event) => updateFormField('fours', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Sixes
            <input
              type="number"
              min="0"
              value={formValues.sixes}
              required
              onChange={(event) => updateFormField('sixes', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Not Out
            <select
              value={formValues.not_out}
              required
              onChange={(event) => updateFormField('not_out', event.target.value)}
              className={selectClass}
            >
              <option value="">Select status</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Saving...' : editingBattingStatId ? 'Save Batting Stat' : 'Add Batting Stat'}
            </button>
          </div>

          {editingBattingStatId ? (
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Cancel Edit
              </button>
            </div>
          ) : null}

          {createError ? <p className="sm:col-span-2 lg:col-span-4 text-sm text-red-300">{createError}</p> : null}
          {createSuccess ? (
            <p className="sm:col-span-2 lg:col-span-4 text-sm text-emerald-300">{createSuccess}</p>
          ) : null}
        </form>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-slate-300">Loading batting stats...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load batting stats: {error}</p>
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
                    Runs
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Balls
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    4s
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    6s
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Not Out
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredBattingStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getMatchLabel(stat.match_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getPlayerLabel(stat.player_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.runs}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.balls}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.fours}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{stat.sixes}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {stat.not_out ? 'Yes' : 'No'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditBattingStat(stat)}
                          className="rounded-lg border border-amber-300/40 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/15"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingBattingStatId === stat.id}
                          onClick={() => handleDeleteBattingStat(stat.id)}
                          className="rounded-lg border border-red-300/40 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingBattingStatId === stat.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredBattingStats.length} of {battingStats.length} batting stats
          </p>
        </>
      )}
    </section>
  )
}
