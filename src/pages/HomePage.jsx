import { useState, useEffect } from 'react'
import { getRooms } from '../services/roomsService'
import { getPublicLocales } from '../services/localesService'
import RoomCard from '../components/RoomCard'

function HomePage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    city: '', difficulty: '', theme: '', sort: 'new'
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [cities, setCities] = useState([])

  useEffect(() => {
    fetchRooms()
  }, [filters, page])


  useEffect(() => {
    fetchCities()
  }, [])

  async function fetchCities() {
    try {
      const res = await getPublicLocales()
      const locales = res.data.locales || []
      const unique = Array.from(
        new Set(
          locales
            .map(l => String(l.city || '').trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b))

      setCities(unique)
    } catch (err) {
      setCities([])
    }
  }

  async function fetchRooms() {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: 12, ...filters }
      Object.keys(params).forEach(k => params[k] === '' && delete params[k])

      const res = await getRooms(params)
      setRooms(res.data.rooms || [])
      setTotalPages(res.data.pages || 1)
    } catch (err) {
      setError('Error al cargar las salas')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
    setPage(1)
  }

  function resetFilters() {
    setFilters({ city: '', difficulty: '', theme: '', sort: 'new' })
    setPage(1)
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="fw-bold">Catálogo de salas</h1>
        <p className="text-muted">Encuentra tu próxima aventura</p>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <select
                name="city"
                className="form-select"
                value={filters.city}
                onChange={handleFilterChange}
              >
                <option value="">Todas las ciudades</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select name="difficulty" className="form-select" value={filters.difficulty} onChange={handleFilterChange}>
                <option value="">Dificultad</option>
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="theme"
                className="form-control"
                placeholder="Temática..."
                value={filters.theme}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <select name="sort" className="form-select" value={filters.sort} onChange={handleFilterChange}>
                <option value="new">Más recientes</option>
                <option value="priceAsc">Precio: menor</option>
                <option value="priceDesc">Precio: mayor</option>
                <option value="popular">Más valoradas</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="spinner-wrap">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Sin resultados */}
      {!loading && !error && rooms.length === 0 && (
        <div className="empty-state">
          <p className="fs-4">No encontramos salas con esos filtros</p>
          <button className="btn btn-outline-primary" onClick={resetFilters}>Ver todas</button>
        </div>
      )}

      {/* Grid de salas */}
      {!loading && !error && rooms.length > 0 && (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
            {rooms.map(room => (
              <div className="col" key={room._id}>
                <RoomCard room={room} />
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center">
              <ul className="pagination">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}>Anterior</button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">{page} / {totalPages}</span>
                </li>
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}>Siguiente</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

export default HomePage
