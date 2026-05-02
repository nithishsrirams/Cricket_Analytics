import { ResourceTablePage } from '../components/ResourceTablePage'

type TeamRow = {
  id: number
  name: string
  league: string | null
  home_venue_id: number | null
  owner: string | null
  coach: string | null
}

export function TeamsView() {
  return (
    <ResourceTablePage<TeamRow>
      title="Teams"
      description="GET /teams lists team metadata and home venue references."
      endpoint="/teams"
      searchableFields={['id', 'name', 'league', 'home_venue_id', 'owner', 'coach']}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'name', header: 'Name', value: (row) => row.name },
        { key: 'league', header: 'League', value: (row) => row.league || 'Unknown' },
        { key: 'home_venue_id', header: 'Home Venue', value: (row) => row.home_venue_id ?? 'N/A' },
        { key: 'owner', header: 'Owner', value: (row) => row.owner || 'Unknown' },
        { key: 'coach', header: 'Coach', value: (row) => row.coach || 'Unknown' },
      ]}
    />
  )
}