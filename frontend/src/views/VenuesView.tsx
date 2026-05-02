import { ResourceTablePage } from '../components/ResourceTablePage'

type VenueRow = {
  id: number
  name: string
  city: string | null
  country: string | null
  capacity: number | null
}

export function VenuesView() {
  return (
    <ResourceTablePage<VenueRow>
      title="Venues"
      description="GET /venues returns stadium locations and capacities."
      endpoint="/venues"
      searchableFields={['id', 'name', 'city', 'country', 'capacity']}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'name', header: 'Name', value: (row) => row.name },
        { key: 'city', header: 'City', value: (row) => row.city || 'Unknown' },
        { key: 'country', header: 'Country', value: (row) => row.country || 'Unknown' },
        { key: 'capacity', header: 'Capacity', value: (row) => (row.capacity ? row.capacity.toLocaleString('en-IN') : 'N/A') },
      ]}
    />
  )
}