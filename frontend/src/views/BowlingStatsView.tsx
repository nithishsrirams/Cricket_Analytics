import { ResourceTablePage } from '../components/ResourceTablePage'

type BowlingRow = {
  id: number
  match_id: number
  player_id: number
  overs: number
  wickets: number
  runs_conceded: number
  extras: number
}

export function BowlingStatsView() {
  return (
    <ResourceTablePage<BowlingRow>
      title="Bowling Stats"
      description="GET /bowling_stats lists bowling figures and wickets for each player-match row."
      endpoint="/bowling_stats"
      searchableFields={['id', 'match_id', 'player_id', 'overs', 'wickets', 'runs_conceded', 'extras']}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'match_id', header: 'Match', value: (row) => row.match_id },
        { key: 'player_id', header: 'Player', value: (row) => row.player_id },
        { key: 'overs', header: 'Overs', value: (row) => row.overs },
        { key: 'wickets', header: 'Wickets', value: (row) => row.wickets },
        { key: 'runs_conceded', header: 'Runs Conceded', value: (row) => row.runs_conceded },
        { key: 'extras', header: 'Extras', value: (row) => row.extras },
      ]}
    />
  )
}