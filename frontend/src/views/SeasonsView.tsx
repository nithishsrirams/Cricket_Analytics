import { useEffect, useMemo, useState } from 'react'

import { fetchJson, postJson } from '../lib/api'

type SeasonRow = {
  id: number
  year: number
  league: string | null
  playoff_format: string | null
  total_teams: number
}

type SeasonFormValues = {
  year: string
  league: string
  playoff_format: string
  total_teams: string
}

const initialFormValues: SeasonFormValues = {
  year: '',
  league: '',
  playoff_format: '',
  total_teams: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none'

export function SeasonsView() {
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<SeasonFormValues>(initialFormValues)

  useEffect(() => {
    let isMounted = true

    async function loadSeasons() {
      setLoading(true)
      setError(null)

      try {
        const seasonData = await fetchJson<SeasonRow[]>('/seasons')
        if (isMounted) {
          setSeasons(seasonData)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load seasons')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadSeasons()

    return () => {
      isMounted = false
    }
  }, [reloadCount])

  const leagueOptions = useMemo(() => {
    const leagues = new Set(
      seasons
        .map((season) => season.league?.trim())
        .filter((league): league is string => Boolean(league)),
    )

    return Array.from(leagues).sort((a, b) => a.localeCompare(b))
  }, [seasons])

  const playoffFormatOptions = useMemo(() => {
    const playoffFormats = new Set(
      seasons
        .map((season) => season.playoff_format?.trim())
        .filter((playoffFormat): playoffFormat is string => Boolean(playoffFormat)),
    )

    return Array.from(playoffFormats).sort((a, b) => a.localeCompare(b))
  }, [seasons])

  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredSeasons = normalizedSearch
    ? seasons.filter((season) =>
        [season.id, season.year, season.league, season.playoff_format, season.total_teams].some((value) =>
          String(value ?? '').toLowerCase().includes(normalizedSearch),
        ),
      )
    : seasons

  function updateFormField(field: keyof SeasonFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  async function handleCreateSeason(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(true)

    try {
      await postJson('/seasons', {
        year: Number(formValues.year),
        league: formValues.league,
        playoff_format: formValues.playoff_format || undefined,
        total_teams: Number(formValues.total_teams),
      })

      setFormValues(initialFormValues)
      setCreateSuccess('Season added successfully.')
      setReloadCount((count) => count + 1)
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Could not add season')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Seasons</h2>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search seasons"
            className={inputClass}
          />
        </label>
      </div>

      <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white">Add Season</h3>
        <form onSubmit={handleCreateSeason} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-200">
            Year
            <input
              type="number"
              value={formValues.year}
              required
              onChange={(event) => updateFormField('year', event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-200">
            League
            <input
              list="season-league-options"
              value={formValues.league}
              required
              placeholder="Select or type league"
              onChange={(event) => updateFormField('league', event.target.value)}
              className={inputClass}
            />
            <datalist id="season-league-options">
              {leagueOptions.map((league) => (
                <option key={league} value={league} />
              ))}
            </datalist>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Playoff Format
            <input
              list="season-playoff-format-options"
              value={formValues.playoff_format}
              placeholder="Select or type format"
              onChange={(event) => updateFormField('playoff_format', event.target.value)}
              className={inputClass}
            />
            <datalist id="season-playoff-format-options">
              {playoffFormatOptions.map((playoffFormat) => (
                <option key={playoffFormat} value={playoffFormat} />
              ))}
            </datalist>
          </label>

          <label className="text-sm font-medium text-slate-200">
            Total Teams
            <input
              type="number"
              min="0"
              value={formValues.total_teams}
              required
              onChange={(event) => updateFormField('total_teams', event.target.value)}
              className={inputClass}
            />
          </label>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Adding...' : 'Add Season'}
            </button>
            {createError ? <p className="mt-2 text-sm text-red-300">{createError}</p> : null}
            {createSuccess ? <p className="mt-2 text-sm text-emerald-300">{createSuccess}</p> : null}
          </div>
        </form>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-slate-300">Loading seasons...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load seasons: {error}</p>
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
                    Year
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    League
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Playoff Format
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Teams
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredSeasons.map((season) => (
                  <tr key={season.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{season.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{season.year}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {season.league || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                      {season.playoff_format || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">{season.total_teams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredSeasons.length} of {seasons.length} seasons
          </p>
        </>
      )}
    </section>
  )
}
