import { useEffect, useMemo, useState } from 'react'

import { fetchJson, postJson } from '../lib/api'

export type TableColumn<T extends Record<string, unknown>> = {
  key: string
  header: string
  value: (row: T) => React.ReactNode
}

type ResourceTablePageProps<T extends Record<string, unknown>> = {
  title: string
  endpoint: string
  columns: Array<TableColumn<T>>
  searchableFields: Array<keyof T & string>
  badgeText?: string
  rowKey?: (row: T, rowIndex: number) => string | number
  createForm?: {
    title: string
    endpoint: string
    submitLabel?: string
    fields: Array<{
      name: string
      label: string
      type?: 'text' | 'number' | 'date'
      required?: boolean
      placeholder?: string
    }>
    buildPayload: (values: Record<string, string>) => unknown
  }
}

export function ResourceTablePage<T extends Record<string, unknown>>({
  title,
  endpoint,
  columns,
  searchableFields,
  badgeText,
  rowKey,
  createForm,
}: ResourceTablePageProps<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    if (!createForm) {
      return {}
    }

    return createForm.fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = ''
      return acc
    }, {})
  })

  useEffect(() => {
    let isMounted = true

    async function loadRows() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchJson<T[]>(endpoint)
        if (isMounted) {
          setRows(data)
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load data')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadRows()

    return () => {
      isMounted = false
    }
  }, [endpoint, reloadCount])

  useEffect(() => {
    if (!createForm) {
      return
    }

    setFormValues(
      createForm.fields.reduce<Record<string, string>>((acc, field) => {
        acc[field.name] = ''
        return acc
      }, {}),
    )
  }, [createForm])

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    if (!normalizedSearch) {
      return rows
    }

    return rows.filter((row) =>
      searchableFields.some((field) => {
        const value = row[field]
        if (value === null || value === undefined) {
          return false
        }

        return String(value).toLowerCase().includes(normalizedSearch)
      }),
    )
  }, [rows, searchText, searchableFields])

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!createForm) {
      return
    }

    setIsSubmitting(true)
    setCreateError(null)
    setCreateSuccess(null)

    try {
      await postJson(createForm.endpoint, createForm.buildPayload(formValues))
      setCreateSuccess('Record created successfully.')
      setReloadCount((count) => count + 1)
      setFormValues(
        createForm.fields.reduce<Record<string, string>>((acc, field) => {
          acc[field.name] = ''
          return acc
        }, {}),
      )
    } catch (submitError) {
      setCreateError(submitError instanceof Error ? submitError.message : 'Could not create record')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {badgeText ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              {badgeText}
            </span>
          ) : null}
        </div>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <label className="text-sm font-medium text-slate-200">
          Search
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search any visible field"
            className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
          />
        </label>
      </div>

      {createForm ? (
        <div className="border-b border-white/10 bg-white/5 p-5 sm:p-6">
          <h3 className="text-base font-semibold text-white">{createForm.title}</h3>
          <form onSubmit={handleCreateSubmit} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {createForm.fields.map((field) => (
              <label key={field.name} className="text-sm font-medium text-slate-200">
                {field.label}
                <input
                  type={field.type || 'text'}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formValues[field.name] || ''}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                />
              </label>
            ))}

            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Saving...' : createForm.submitLabel || 'Create'}
              </button>
              {createError ? <p className="mt-2 text-sm text-red-300">{createError}</p> : null}
              {createSuccess ? <p className="mt-2 text-sm text-emerald-300">{createSuccess}</p> : null}
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <p className="p-6 text-sm text-slate-300">Loading {title.toLowerCase()}...</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-300">Failed to load {title.toLowerCase()}: {error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-800/60">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredRows.map((row, rowIndex) => (
                  <tr key={rowKey ? rowKey(row, rowIndex) : rowIndex} className="hover:bg-white/5">
                    {columns.map((column) => (
                      <td key={column.key} className="whitespace-nowrap px-5 py-3 text-sm text-slate-200">
                        {column.value(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/10 p-4 text-right text-xs text-slate-400">
            Showing {filteredRows.length} of {rows.length} records
          </p>
        </>
      )}
    </section>
  )
}
