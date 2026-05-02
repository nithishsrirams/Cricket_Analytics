import { ResourceTablePage } from '../components/ResourceTablePage'

type SeasonRow = {
  id: number
  year: number
  league: string | null
  playoff_format: string | null
  total_teams: number
}

export function SeasonsView() {
  return (
    <ResourceTablePage<SeasonRow>
      title="Seasons"
      description="GET /seasons gives season metadata, including playoff format and team count."
      endpoint="/seasons"
      searchableFields={['id', 'year', 'league', 'playoff_format', 'total_teams']}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'year', header: 'Year', value: (row) => row.year },
        { key: 'league', header: 'League', value: (row) => row.league || 'Unknown' },
        { key: 'playoff_format', header: 'Playoff Format', value: (row) => row.playoff_format || 'Unknown' },
        { key: 'total_teams', header: 'Teams', value: (row) => row.total_teams },
      ]}
    />
  )
}