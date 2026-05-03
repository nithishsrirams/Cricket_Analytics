import { useEffect, useMemo, useState } from 'react'

import { fetchJson, postJson } from '../lib/api'

type Player = {
  id: number
  name: string
  nationality: string | null
  role: string | null
}

type PlayerOptions = {
  nationalities: string[]
  roles: string[]
}

export function PlayersView() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerOptions, setPlayerOptions] = useState<PlayerOptions>({ nationalities: [], roles: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [reloadCount, setReloadCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null)
  const [formValues, setFormValues] = useState({
    name: '',
    nationality: '',
    role: '',
  })

  useEffect(() => {
    let isMounted = true

    async function loadPlayers() {
      setLoading(true)
      setError(null)

      try {
        const [data, options] = await Promise.all([
          fetchJson<Player[]>('/players'),
          fetchJson<PlayerOptions>('/players/options'),
        ])
        if (isMounted) {
          setPlayers(data)
          setPlayerOptions(options)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Could not load players')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPlayers()

    return () => {
      isMounted = false
    }
  }, [reloadCount])

  const nationalityOptions = useMemo(() => {
    const nationalities = new Set(
      [...playerOptions.nationalities, ...players.map((player) => player.nationality)]
        .map((nationality) => nationality?.trim())
        .filter((nationality): nationality is string => Boolean(nationality)),
    )

    return Array.from(nationalities).sort((a, b) => a.localeCompare(b))
  }, [playerOptions.nationalities, players])

  const roleOptions = useMemo(() => {
    const roles = new Set(
      [...playerOptions.roles, ...players.map((player) => player.role)]
        .map((role) => role?.trim())
        .filter((role): role is string => Boolean(role)),
    )

    return ['all', ...Array.from(roles).sort((a, b) => a.localeCompare(b))]
  }, [playerOptions.roles, players])

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return players.filter((player) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        player.name.toLowerCase().includes(normalizedSearch) ||
        String(player.id).includes(normalizedSearch)

      const matchesRole = selectedRole === 'all' || player.role?.trim() === selectedRole

      return matchesSearch && matchesRole
    })
  }, [players, searchText, selectedRole])

  async function handleCreatePlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(true)

    try {
      await postJson('/players', {
        name: formValues.name,
        nationality: formValues.nationality,
        role: formValues.role,
      })

      setFormValues({ name: '', nationality: '', role: '' })
      setCreateSuccess('Player added successfully.')
      setReloadCount((count) => count + 1)
    } catch (createPlayerError) {
      setCreateError(createPlayerError instanceof Error ? createPlayerError.message : 'Could not add player')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeletePlayer(playerId: number) {
    setDeletingPlayerId(playerId)
    setError(null)

    try {
      const response = await fetch(`/players/${playerId}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      setPlayers((current) => current.filter((player) => player.id !== playerId))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete player')
    } finally {
      setDeletingPlayerId(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Players</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-white/10 p-5 sm:grid-cols-2 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Type name or ID"
            className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
          />
        </label>

        <label className="text-sm font-medium text-slate-200">
          Filter By Role
          <select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">Add Player</h3>
        <form onSubmit={handleCreatePlayer} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-200">
            Name
            <input
              value={formValues.name}
              required
              onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
            />
          </label>
          <label className="text-sm font-medium text-slate-200">
            Nationality
            <input
              list="player-nationality-options"
              value={formValues.nationality}
              required
              placeholder="Select or type nationality"
              onChange={(event) => setFormValues((current) => ({ ...current, nationality: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
            />
            <datalist id="player-nationality-options">
              {nationalityOptions.map((nationality) => (
                <option key={nationality} value={nationality} />
              ))}
            </datalist>
          </label>
          <label className="text-sm font-medium text-slate-200">
            Role
            <input
              list="player-role-options"
              value={formValues.role}
              required
              placeholder="Select or type role"
              onChange={(event) => setFormValues((current) => ({ ...current, role: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
            />
            <datalist id="player-role-options">
              {roleOptions
                .filter((role) => role !== 'all')
                .map((role) => (
                  <option key={role} value={role} />
                ))}
            </datalist>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Adding...' : 'Add Player'}
            </button>
          </div>

          {createError ? <p className="sm:col-span-2 lg:col-span-4 text-sm text-red-300">{createError}</p> : null}
          {createSuccess ? <p className="sm:col-span-2 lg:col-span-4 text-sm text-emerald-300">{createSuccess}</p> : null}
        </form>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-slate-300">Loading players...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load players: {error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-800/60">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Role
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{player.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-white">{player.name}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {player.role || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      <button
                        type="button"
                        disabled={deletingPlayerId === player.id}
                        onClick={() => handleDeletePlayer(player.id)}
                        className="rounded-lg border border-red-300/40 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingPlayerId === player.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredPlayers.length} of {players.length} players
          </p>
        </>
      )}
    </section>
  )
}
