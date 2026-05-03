import { ResourceTablePage } from '../components/ResourceTablePage'

type MatchRow = {
  id: number
  season_id: number
  venue_id: number
  match_date: string
  format: string | null
  home_team_id: number
  away_team_id: number
  winner_team_id: number | null
  toss_winner_team_id: number | null
}

export function MatchesView() {
  return (
    <ResourceTablePage<MatchRow>
      title="Matches"
      endpoint="/matches"
      searchableFields={[
        'id',
        'season_id',
        'venue_id',
        'match_date',
        'format',
        'home_team_id',
        'away_team_id',
        'winner_team_id',
        'toss_winner_team_id',
      ]}
      rowKey={(row) => row.id}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'match_date', header: 'Date', value: (row) => row.match_date },
        { key: 'format', header: 'Format', value: (row) => row.format || 'Unknown' },
        { key: 'season_id', header: 'Season', value: (row) => row.season_id },
        { key: 'venue_id', header: 'Venue', value: (row) => row.venue_id },
        { key: 'home_team_id', header: 'Home', value: (row) => row.home_team_id },
        { key: 'away_team_id', header: 'Away', value: (row) => row.away_team_id },
        { key: 'winner_team_id', header: 'Winner', value: (row) => row.winner_team_id ?? 'TBD' },
      ]}
      createForm={{
        title: 'Add Match',
        endpoint: '/matches',
        submitLabel: 'Add Match',
        fields: [
          { name: 'season_id', label: 'Season ID', type: 'number', required: true },
          { name: 'venue_id', label: 'Venue ID', type: 'number', required: true },
          { name: 'match_date', label: 'Match Date', type: 'date', required: true },
          { name: 'format', label: 'Format', required: true, placeholder: 'T20 / ODI / Test' },
          { name: 'home_team_id', label: 'Home Team ID', type: 'number', required: true },
          { name: 'away_team_id', label: 'Away Team ID', type: 'number', required: true },
          { name: 'winner_team_id', label: 'Winner Team ID', type: 'number' },
          { name: 'toss_winner_team_id', label: 'Toss Winner Team ID', type: 'number' },
        ],
        buildPayload: (values) => ({
          season_id: Number(values.season_id),
          venue_id: Number(values.venue_id),
          match_date: values.match_date,
          format: values.format,
          home_team_id: Number(values.home_team_id),
          away_team_id: Number(values.away_team_id),
          winner_team_id: values.winner_team_id ? Number(values.winner_team_id) : undefined,
          toss_winner_team_id: values.toss_winner_team_id ? Number(values.toss_winner_team_id) : undefined,
        }),
      }}
    />
  )
}
