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
      endpoint="/batting_stats"
      searchableFields={['id', 'match_id', 'player_id', 'runs', 'balls', 'fours', 'sixes']}
      rowKey={(row) => row.id}
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
      createForm={{
        title: 'Add Batting Stat',
        endpoint: '/batting_stats',
        submitLabel: 'Add Batting Stat',
        fields: [
          { name: 'match_id', label: 'Match ID', type: 'number', required: true },
          { name: 'player_id', label: 'Player ID', type: 'number', required: true },
          { name: 'runs', label: 'Runs', type: 'number', required: true },
          { name: 'balls_faced', label: 'Balls Faced', type: 'number', required: true },
          { name: 'fours', label: 'Fours', type: 'number', required: true },
          { name: 'sixes', label: 'Sixes', type: 'number', required: true },
          { name: 'not_out', label: 'Not Out (true/false)', required: true, placeholder: 'true or false' },
        ],
        buildPayload: (values) => ({
          match_id: Number(values.match_id),
          player_id: Number(values.player_id),
          runs: Number(values.runs),
          balls_faced: Number(values.balls_faced),
          fours: Number(values.fours),
          sixes: Number(values.sixes),
          not_out: values.not_out.toLowerCase() === 'true',
        }),
      }}
    />
  )
}
