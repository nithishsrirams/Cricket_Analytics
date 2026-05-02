import { ResourceTablePage } from '../components/ResourceTablePage'

type ContractRow = {
  id: number
  player_id: number
  team_id: number
  season_id: number
  salary: number
  type: string | null
}

export function ContractsView() {
  return (
    <ResourceTablePage<ContractRow>
      title="Contracts"
      description="GET /contracts exposes player-team-season contract assignments and salary data."
      endpoint="/contracts"
      searchableFields={['id', 'player_id', 'team_id', 'season_id', 'salary', 'type']}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'player_id', header: 'Player', value: (row) => row.player_id },
        { key: 'team_id', header: 'Team', value: (row) => row.team_id },
        { key: 'season_id', header: 'Season', value: (row) => row.season_id },
        { key: 'salary', header: 'Salary INR', value: (row) => row.salary.toLocaleString('en-IN') },
        { key: 'type', header: 'Type', value: (row) => row.type || 'Unknown' },
      ]}
      badgeText="Editable core"
    />
  )
}