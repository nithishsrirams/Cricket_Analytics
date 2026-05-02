import { ResourceTablePage } from '../components/ResourceTablePage'

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

export function BattingStatsView() {
  return (
    <ResourceTablePage<BattingRow>
      title="Batting Stats"
      description="GET /batting_stats lists scorecard-style batting records per match."
      endpoint="/batting_stats"
      searchableFields={['id', 'match_id', 'player_id', 'runs', 'balls', 'fours', 'sixes']}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'match_id', header: 'Match', value: (row) => row.match_id },
        { key: 'player_id', header: 'Player', value: (row) => row.player_id },
        { key: 'runs', header: 'Runs', value: (row) => row.runs },
        { key: 'balls', header: 'Balls', value: (row) => row.balls },
        { key: 'fours', header: '4s', value: (row) => row.fours },
        { key: 'sixes', header: '6s', value: (row) => row.sixes },
        { key: 'not_out', header: 'Not Out', value: (row) => (row.not_out ? 'Yes' : 'No') },
      ]}
    />
  )
}