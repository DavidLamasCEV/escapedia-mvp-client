import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRooms, deleteRoom } from '../services/roomsService'

function OwnerRoomsPage() {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => { fetchRooms() }, [])

  async function fetchRooms() {
    setLoading(true)
    try {
      const res = await getRooms({ limit: 50 })
      setRooms(res.data.rooms || [])
    } catch {
      setError('Error al cargar las salas')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteRoom(id)
      fetchRooms()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar')
    }
  }

  useEffect(() => {
    if (rooms.length > 0) console.log('ROOM SAMPLE:', rooms[0])
  }, [rooms])



  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">🚪 Mis salas</h2>
        <Link to="/owner/salas/nueva" className="btn btn-primary">+ Nueva sala</Link>
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner-border text-primary" role="status" /></div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && rooms.length === 0 && (
        <div className="empty-state">
          <p>Todavía no tienes salas.</p>
          <Link to="/owner/salas/nueva" className="btn btn-primary">Crear primera sala</Link>
        </div>
      )}

      <div className="row g-3">
        {rooms.map(room => (
          <div className="col-12" key={room._id}>
            <div className="card p-3">
              <div className="d-flex gap-3 align-items-center flex-wrap">

                {room.coverImageUrl ? (
                  <img
                    src={room.coverImageUrl}
                    style={{
                      width: 80,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 6
                    }}
                    alt={room.title}
                  />
                ) : (
                  <div
                    className="bg-secondary d-flex align-items-center justify-content-center rounded"
                    style={{ width: 80, height: 60 }}
                  >
                    <span className="text-white">🔐</span>
                  </div>
                )}

                <div className="flex-grow-1">
                  <h5 className="mb-1">{room.title}</h5>
                  <p className="text-muted small mb-0">
                    📍 {room.city} · ⏱ {room.durationMin} min · 💶 desde {room.priceFrom}€ ·
                    ⭐ {room.ratingAvg?.toFixed(1)} ({room.ratingCount})
                  </p>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  <Link
                    to={`/salas/${room._id}`}
                    className="btn btn-outline-secondary btn-sm"
                    target="_blank"
                  >
                    👁 Ver
                  </Link>

                  <Link
                    to={`/owner/salas/${room._id}/editar`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    ✏ Editar
                  </Link>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(room._id, room.title)}
                  >
                    🗑 Eliminar
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default OwnerRoomsPage