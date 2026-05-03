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
      endpoint="/bowling_stats"
      searchableFields={['id', 'match_id', 'player_id', 'overs', 'wickets', 'runs_conceded', 'extras']}
      rowKey={(row) => row.id}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'match_id', header: 'Match', value: (row) => row.match_id },
        { key: 'player_id', header: 'Player', value: (row) => row.player_id },
        { key: 'overs', header: 'Overs', value: (row) => row.overs },
        { key: 'wickets', header: 'Wickets', value: (row) => row.wickets },
        { key: 'runs_conceded', header: 'Runs Conceded', value: (row) => row.runs_conceded },
        { key: 'extras', header: 'Extras', value: (row) => row.extras },
      ]}
      createForm={{
        title: 'Add Bowling Stat',
        endpoint: '/bowling_stats',
        submitLabel: 'Add Bowling Stat',
        fields: [
          { name: 'match_id', label: 'Match ID', type: 'number', required: true },
          { name: 'player_id', label: 'Player ID', type: 'number', required: true },
          { name: 'overs', label: 'Overs', type: 'number', required: true },
          { name: 'wickets', label: 'Wickets', type: 'number', required: true },
          { name: 'runs_conceded', label: 'Runs Conceded', type: 'number', required: true },
          { name: 'extras', label: 'Extras', type: 'number', required: true },
        ],
        buildPayload: (values) => ({
          match_id: Number(values.match_id),
          player_id: Number(values.player_id),
          overs: Number(values.overs),
          wickets: Number(values.wickets),
          runs_conceded: Number(values.runs_conceded),
          extras: Number(values.extras),
        }),
      }}
    />
  )
}
