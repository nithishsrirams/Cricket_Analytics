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
      rowKey={(row) => row.id}
      columns={[
        { key: 'id', header: 'ID', value: (row) => row.id },
        { key: 'name', header: 'Name', value: (row) => row.name },
        { key: 'city', header: 'City', value: (row) => row.city || 'Unknown' },
        { key: 'country', header: 'Country', value: (row) => row.country || 'Unknown' },
        { key: 'capacity', header: 'Capacity', value: (row) => (row.capacity ? row.capacity.toLocaleString('en-IN') : 'N/A') },
      ]}
      createForm={{
        title: 'Add Venue',
        endpoint: '/venues',
        submitLabel: 'Add Venue',
        fields: [
          { name: 'name', label: 'Venue Name', required: true },
          { name: 'city', label: 'City', required: true },
          { name: 'country', label: 'Country', required: true },
          { name: 'capacity', label: 'Capacity', type: 'number', required: true },
        ],
        buildPayload: (values) => ({
          name: values.name,
          city: values.city,
          country: values.country,
          capacity: Number(values.capacity),
        }),
      }}
    />
  )
}