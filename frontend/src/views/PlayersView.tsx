import { useEffect, useMemo, useState } from 'react'

type Player = {
  id: number
  name: string
  role: string | null
}

export function PlayersView() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')

  useEffect(() => {
    let isMounted = true

    async function loadPlayers() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/players')
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as Player[]
        if (isMounted) {
          setPlayers(data)
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
  }, [])

  const roleOptions = useMemo(() => {
    const roles = new Set(
      players
        .map((player) => player.role?.trim())
        .filter((role): role is string => Boolean(role)),
    )

    return ['all', ...Array.from(roles).sort((a, b) => a.localeCompare(b))]
  }, [players])

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return players.filter((player) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        player.name.toLowerCase().includes(normalizedSearch) ||
        String(player.id).includes(normalizedSearch)

      const matchesRole = selectedRole === 'all' || player.role === selectedRole

      return matchesSearch && matchesRole
    })
  }, [players, searchText, selectedRole])

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Players</h2>
        <p className="mt-1 text-sm text-slate-300">
          Data source: GET /players. Search by name or ID, then narrow by role.
        </p>
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
