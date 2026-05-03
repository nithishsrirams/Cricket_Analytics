import { useEffect, useMemo, useState } from 'react'

import { fetchJson, postJson } from '../lib/api'

type ContractRow = {
  id: number
  player_id: number
  team_id: number
  season_id: number
  salary: number
  type: string | null
}

type PlayerRow = {
  id: number
  name: string
}

type TeamRow = {
  id: number
  name: string
}

type SeasonRow = {
  id: number
  year: number
  league: string | null
}

type ContractFormValues = {
  player_id: string
  team_id: string
  season_id: string
  salary_inr: string
  contract_type: string
}

const initialFormValues: ContractFormValues = {
  player_id: '',
  team_id: '',
  season_id: '',
  salary_inr: '',
  contract_type: '',
}

const defaultContractTypeOptions = ['Auction', 'Retained']

const inputClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none'

const selectClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none'

export function ContractsView() {
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<ContractFormValues>(initialFormValues)

  useEffect(() => {
    let isMounted = true

    async function loadContractData() {
      setLoading(true)
      setError(null)

      try {
        const [contractData, playerData, teamData, seasonData] = await Promise.all([
          fetchJson<ContractRow[]>('/contracts'),
          fetchJson<PlayerRow[]>('/players'),
          fetchJson<TeamRow[]>('/teams'),
          fetchJson<SeasonRow[]>('/seasons'),
        ])

        if (isMounted) {
          setContracts(contractData)
          setPlayers(playerData)
          setTeams(teamData)
          setSeasons(seasonData)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load contracts')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadContractData()

    return () => {
      isMounted = false
    }
  }, [reloadCount])

  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams])
  const seasonById = useMemo(() => new Map(seasons.map((season) => [season.id, season])), [seasons])

  const contractTypeOptions = useMemo(() => {
    const seenTypes = new Set<string>()
    const databaseTypes = contracts
      .map((contract) => contract.type?.trim())
      .filter((type): type is string => Boolean(type))
      .sort((a, b) => a.localeCompare(b))

    return [...defaultContractTypeOptions, ...databaseTypes].filter((type) => {
      const normalizedType = type.toLowerCase()
      if (seenTypes.has(normalizedType)) {
        return false
      }

      seenTypes.add(normalizedType)
      return true
    })
  }, [contracts])

  function getPlayerLabel(playerId: number) {
    return playerById.get(playerId)?.name || `Player ${playerId}`
  }

  function getTeamLabel(teamId: number) {
    return teamById.get(teamId)?.name || `Team ${teamId}`
  }

  function getSeasonLabel(seasonId: number) {
    const season = seasonById.get(seasonId)
    if (!season) {
      return `Season ${seasonId}`
    }

    return season.league ? `${season.year} - ${season.league}` : String(season.year)
  }

  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredContracts = normalizedSearch
    ? contracts.filter((contract) =>
        [
          contract.id,
          getPlayerLabel(contract.player_id),
          getTeamLabel(contract.team_id),
          getSeasonLabel(contract.season_id),
          contract.salary,
          contract.type,
        ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch)),
      )
    : contracts

  function updateFormField(field: keyof ContractFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  async function handleCreateContract(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(true)

    try {
      await postJson('/contracts', {
        player_id: Number(formValues.player_id),
        team_id: Number(formValues.team_id),
        season_id: Number(formValues.season_id),
        salary_inr: Number(formValues.salary_inr),
        contract_type: formValues.contract_type,
      })

      setFormValues(initialFormValues)
      setCreateSuccess('Contract added successfully.')
      setReloadCount((count) => count + 1)
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Could not add contract')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Contracts</h2>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search contracts"
            className={inputClass}
          />
        </label>
      </div>

      <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">Add Contract</h3>
        <form onSubmit={handleCreateContract} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
            Team
            <select
              value={formValues.team_id}
              required
              onChange={(event) => updateFormField('team_id', event.target.value)}
              className={selectClass}
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

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
            Salary INR
            <input
              type="number"
              min="0"
              value={formValues.salary_inr}
              required
              onChange={(event) => updateFormField('salary_inr', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            Contract Type
            <select
              value={formValues.contract_type}
              required
              onChange={(event) => updateFormField('contract_type', event.target.value)}
              className={selectClass}
            >
              <option value="">Select type</option>
              {contractTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2 lg:col-span-5">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Adding...' : 'Add Contract'}
            </button>
            {createError ? <p className="mt-2 text-sm text-red-300">{createError}</p> : null}
            {createSuccess ? <p className="mt-2 text-sm text-emerald-300">{createSuccess}</p> : null}
          </div>
        </form>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-slate-300">Loading contracts...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load contracts: {error}</p>
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
                    Player
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Team
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Season
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Salary INR
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{contract.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getPlayerLabel(contract.player_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getTeamLabel(contract.team_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {getSeasonLabel(contract.season_id)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {contract.salary.toLocaleString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {contract.type || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredContracts.length} of {contracts.length} contracts
          </p>
        </>
      )}
    </section>
  )
}
