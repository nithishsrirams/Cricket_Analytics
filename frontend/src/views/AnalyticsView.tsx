import { useEffect, useState } from 'react'
import { fetchJson } from '../lib/api'
import { AnalyticsCard } from '../components/AnalyticsCard'

type AnalyticsNumber = number | string | boolean | null | undefined

interface TopBatsman {
  name: string
  runs: AnalyticsNumber
  balls: AnalyticsNumber
  strike_rate: AnalyticsNumber
}

interface TopBowler {
  name: string
  wickets: AnalyticsNumber
}

interface ValuePlayer {
  name: string
  runs: AnalyticsNumber
  fours: AnalyticsNumber
  sixes: AnalyticsNumber
  not_outs: AnalyticsNumber
  salary: AnalyticsNumber
  value_index: AnalyticsNumber
}

interface TeamWins {
  name: string
  wins: AnalyticsNumber
}

interface AvgRuns {
  name: string
  avg_runs: AnalyticsNumber
}

function toFiniteNumber(value: AnalyticsNumber) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function formatNumber(value: AnalyticsNumber) {
  const numberValue = toFiniteNumber(value)
  return numberValue === null ? 'N/A' : numberValue.toLocaleString('en-IN')
}

function formatFixed(value: AnalyticsNumber, fractionDigits = 2) {
  const numberValue = toFiniteNumber(value)
  return numberValue === null ? 'N/A' : numberValue.toFixed(fractionDigits)
}

function formatCurrency(value: AnalyticsNumber) {
  const numberValue = toFiniteNumber(value)
  return numberValue === null ? 'N/A' : '₹' + numberValue.toLocaleString('en-IN')
}

export function AnalyticsView() {
  const [topBatsmen, setTopBatsmen] = useState<TopBatsman[]>([])
  const [topBowlers, setTopBowlers] = useState<TopBowler[]>([])
  const [valuePlayers, setValuePlayers] = useState<ValuePlayer[]>([])
  const [teamWins, setTeamWins] = useState<TeamWins[]>([])
  const [avgRuns, setAvgRuns] = useState<AvgRuns[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const [batsmen, bowlers, value, wins, averages] = await Promise.all([
          fetchJson<TopBatsman[]>('/analytics/top_batsmen'),
          fetchJson<TopBowler[]>('/analytics/top_bowlers'),
          fetchJson<ValuePlayer[]>('/analytics/value_players'),
          fetchJson<TeamWins[]>('/analytics/team_wins'),
          fetchJson<AvgRuns[]>('/analytics/avg_runs'),
        ])

        setTopBatsmen(batsmen || [])
        setTopBowlers(bowlers || [])
        setValuePlayers(value || [])
        setTeamWins(wins || [])
        setAvgRuns(averages || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const hasData =
    topBatsmen.length > 0 ||
    topBowlers.length > 0 ||
    valuePlayers.length > 0 ||
    teamWins.length > 0 ||
    avgRuns.length > 0

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Analytics Dashboard</h2>
      </div>

      <div className="p-5 sm:p-6">
        {loading && <p className="text-sm text-slate-300">Loading analytics...</p>}

        {error && <p className="text-sm text-red-300">Error: {error}</p>}

        {!loading && !error && !hasData && (
          <p className="text-sm text-slate-300">
            No analytics data available. Add matches, batting stats, bowling stats, and contracts to see insights.
          </p>
        )}

        {!loading && !error && hasData && (
          <div className="grid gap-6 lg:grid-cols-2">
            {topBatsmen.length > 0 && (
              <AnalyticsCard
                title="Top Batsmen by Strike Rate"
                columns={['Player', 'Runs', 'Balls', 'Strike Rate']}
                rows={topBatsmen.map((row) => [
                  row.name,
                  formatNumber(row.runs),
                  formatNumber(row.balls),
                  formatFixed(row.strike_rate) + '%',
                ])}
              />
            )}

            {topBowlers.length > 0 && (
              <AnalyticsCard
                title="Top Bowlers by Wickets"
                columns={['Player', 'Wickets']}
                rows={topBowlers.map((row) => [row.name, formatNumber(row.wickets)])}
              />
            )}

            {teamWins.length > 0 && (
              <AnalyticsCard
                title="Team Wins"
                columns={['Team', 'Wins']}
                rows={teamWins.map((row) => [row.name, formatNumber(row.wins)])}
              />
            )}

            {avgRuns.length > 0 && (
              <AnalyticsCard
                title="Average Runs per Player"
                columns={['Player', 'Average Runs']}
                rows={avgRuns.map((row) => [row.name, formatFixed(row.avg_runs)])}
              />
            )}

            {valuePlayers.length > 0 && (
              <div className="lg:col-span-2">
                <AnalyticsCard
                  title="Value Players (Salary vs Performance)"
                  columns={['Player', 'Runs', '4s', '6s', 'Not Outs', 'Salary', 'Value Index / Cr']}
                  rows={valuePlayers.map((row) => [
                    row.name,
                    formatNumber(row.runs),
                    formatNumber(row.fours),
                    formatNumber(row.sixes),
                    formatNumber(row.not_outs),
                    formatCurrency(row.salary),
                    formatFixed(row.value_index),
                  ])}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
