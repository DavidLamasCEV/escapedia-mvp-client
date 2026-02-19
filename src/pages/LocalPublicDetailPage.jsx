import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicLocalById, getPublicRoomsByLocal } from '../services/localesService'
import RoomCard from '../components/RoomCard'

function LocalPublicDetailPage() {
  const { id } = useParams()

  const [local, setLocal] = useState(null)
  const [rooms, setRooms] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [id])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const [localRes, roomsRes] = await Promise.all([
        getPublicLocalById(id),
        getPublicRoomsByLocal(id),
      ])

      setLocal(localRes.data.local)
      setRooms(roomsRes.data.rooms || [])
    } catch {
      setError('Error al cargar el local o sus salas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!local) return <div className="alert alert-warning">Local no encontrado</div>

  return (
    <div>
      <div className="mb-3">
        <Link to="/locales" className="btn btn-outline-secondary btn-sm">
          Volver a locales
        </Link>
      </div>

      <div className="card mb-4">
        <img
          src={local.coverImageUrl}
          alt={local.name}
          style={{ width: '100%', height: 260, objectFit: 'cover' }}
        />
        <div className="card-body">
          <h2 className="fw-bold mb-1">{local.name}</h2>
          <p className="text-muted mb-0">
            {local.city}
            {local.address ? ` · ${local.address}` : ''}
          </p>
          {(local.phone || local.email) && (
            <p className="text-muted small mt-2 mb-0">
              {local.phone ? `Tel: ${local.phone}` : ''}
              {local.phone && local.email ? ' · ' : ''}
              {local.email ? `Email: ${local.email}` : ''}
            </p>
          )}
        </div>
      </div>

      <h4 className="fw-bold mb-3">Salas de este local</h4>

      {rooms.length === 0 ? (
        <div className="empty-state">
          <p>Este local no tiene salas publicadas.</p>
        </div>
      ) : (
        <div className="row g-3">
          {rooms.map(room => (
            <div className="col-12 col-md-6 col-lg-4" key={room._id}>
              <RoomCard room={room} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LocalPublicDetailPage
