import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicLocales } from '../services/localesService'

function normalize(str) {
  return (str || '').trim().toLowerCase()
}

function LocalesCatalogPage() {
  const [locales, setLocales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    fetchLocales()
  }, [])

  async function fetchLocales() {
    setLoading(true)
    setError(null)
    try {
      const res = await getPublicLocales()
      setLocales(res.data.locales || [])
    } catch {
      setError('Error al cargar los locales')
    } finally {
      setLoading(false)
    }
  }

  const cities = useMemo(() => {
    const unique = new Set()
    locales.forEach(l => {
      if (l.city) unique.add(l.city.trim())
    })
    return Array.from(unique).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' })
    )
  }, [locales])

  const filtered = useMemo(() => {
    if (!selectedCity) return locales
    return locales.filter(l => normalize(l.city) === normalize(selectedCity))
  }, [locales, selectedCity])

  return (
    <div>
      <h1 className="fw-bold">Catálogo de Locales</h1>
      <p className="text-muted">Explora locales por ciudad y descubre sus salas.</p>

      <div className="card p-3 mb-4">
        <label className="form-label mb-2">Filtrar por ciudad</label>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          <select
            className="form-select"
            style={{ maxWidth: 320 }}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {cities.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <div className="text-muted small">
            Mostrando {filtered.length} de {locales.length}
          </div>
        </div>
      </div>

      {loading && (
        <div className="spinner-wrap">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <p>No hay locales para esa ciudad.</p>
        </div>
      )}

      <div className="row g-3">
        {filtered.map(local => (
          <div className="col-12 col-md-6 col-lg-4" key={local._id}>
            <Link to={`/locales/${local._id}`} className="text-decoration-none text-dark">
              <div className="card h-100">
                <img
                  src={local.coverImageUrl}
                  className="card-img-top"
                  alt={local.name}
                  style={{ height: 180, objectFit: 'cover' }}
                />

                <div className="card-body">
                  <h5 className="card-title mb-1">{local.name}</h5>
                  <p className="text-muted small mb-0">
                    {local.city}
                    {local.address ? ` · ${local.address}` : ''}
                  </p>
                </div>

                <div className="card-footer bg-white border-0 pt-0">
                  <span className="btn btn-outline-primary btn-sm">
                    Ver salas
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocalesCatalogPage
