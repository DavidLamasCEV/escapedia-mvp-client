import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRooms } from '../services/roomsService'

function HomePage() {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Filtros
  const [filters, setFilters] = useState({
    city: '', difficulty: '', theme: '', sort: 'new'
  })
  const [page, setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchRooms()
  }, [filters, page])

  async function fetchRooms() {
    setLoading(true)
    setError(null)
    try {
      // Quitamos los campos vacíos para no contaminar la query
      const params = { page, limit: 12, ...filters }
      Object.keys(params).forEach(k => params[k] === '' && delete params[k])

      const res = await getRooms(params)
      setRooms(res.data.rooms || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (err) {
      setError('Error al cargar las salas')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
    setPage(1) // Volvemos a la primera página al filtrar
  }

  function resetFilters() {
    setFilters({ city: '', difficulty: '', theme: '', sort: 'new' })
    setPage(1)
  }

  function difficultyBadge(difficulty) {
    const map = {
      easy:   'success',
      medium: 'warning',
      hard:   'danger'
    }
    const labels = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' }
    return <span className={`badge bg-${map[difficulty] || 'secondary'}`}>{labels[difficulty] || difficulty}</span>
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="fw-bold">🔐 Catálogo de salas</h1>
        <p className="text-muted">Encuentra tu próxima aventura</p>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                name="city"
                className="form-control"
                placeholder="🏙 Ciudad..."
                value={filters.city}
                onChange={handleFilterChange}
              />
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
                placeholder="🎭 Temática..."
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
          <p className="fs-4">🔍 No encontramos salas con esos filtros</p>
          <button className="btn btn-outline-primary" onClick={resetFilters}>Ver todas</button>
        </div>
      )}

      {/* Grid de salas */}
      {!loading && !error && rooms.length > 0 && (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
            {rooms.map(room => (
              <div className="col" key={room._id}>
                <Link to={`/salas/${room._id}`} className="text-decoration-none text-dark">
                  <div className="card h-100 room-card">
                    {room.coverImageUrl
                      ? <img src={room.coverImageUrl} className="card-img-top" alt={room.title} />
                      : <div className="card-img-top bg-secondary d-flex align-items-center justify-content-center" style={{ height: 180 }}>
                          <span className="text-white fs-1">🔐</span>
                        </div>
                    }
                    <div className="card-body">
                      <div className="mb-1">
                        {room.themes?.slice(0, 2).map(t => (
                          <span key={t} className="badge bg-light text-dark me-1 border">{t}</span>
                        ))}
                      </div>
                      <h5 className="card-title">{room.title}</h5>
                      <p className="text-muted small mb-2">📍 {room.city} · ⏱ {room.durationMin} min · 👥 {room.playersMin}–{room.playersMax}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {difficultyBadge(room.difficulty)}
                          <span className="ms-2 small text-muted">⭐ {room.ratingAvg?.toFixed(1)} ({room.ratingCount})</span>
                        </div>
                        <span className="fw-bold text-primary">desde {room.priceFrom}€</span>
                      </div>
                    </div>
                  </div>
                </Link>
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