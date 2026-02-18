import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyBookings, cancelBooking } from '../services/bookingsService'

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',   css: 'badge-pending' },
  confirmed: { label: 'Confirmada',  css: 'badge-confirmed' },
  completed: { label: 'Completada',  css: 'badge-completed' },
  cancelled: { label: 'Cancelada',   css: 'badge-cancelled' },
}

function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [filter, setFilter]     = useState('')     // filtro por estado

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    setLoading(true)
    try {
      const res = await getMyBookings()
      setBookings(res.data.bookings || res.data || [])
    } catch {
      setError('Error al cargar tus reservas')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id) {
    if (!confirm('¿Cancelar esta reserva?')) return
    try {
      await cancelBooking(id)
      fetchBookings() // recarga
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cancelar')
    }
  }

  const visible = filter ? bookings.filter(b => b.status === filter) : bookings

  return (
    <div>
      <h2 className="fw-bold mb-4">📅 Mis reservas</h2>

      {/* Filtros de estado */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s === '' ? 'Todas' : STATUS_LABELS[s]?.label}
          </button>
        ))}
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner-border text-primary" role="status" /></div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && visible.length === 0 && (
        <div className="empty-state">
          <p>No tienes reservas{filter ? ' con este estado' : ''}.</p>
          <Link to="/" className="btn btn-primary">Explorar salas</Link>
        </div>
      )}

      <div className="row g-3">
        {visible.map(booking => {
          const st = STATUS_LABELS[booking.status] || { label: booking.status, css: '' }
          return (
            <div className="col-12" key={booking._id}>
              <div className="card p-3">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1">{booking.roomId?.title || 'Sala'}</h5>
                    <p className="text-muted small mb-1">
                      📅 {new Date(booking.scheduledAt).toLocaleString('es-ES')} &nbsp;·&nbsp;
                      👥 {booking.players} jugadores
                    </p>
                    {booking.roomId?.city && <p className="text-muted small mb-0">📍 {booking.roomId.city}</p>}
                  </div>
                  <span className={`badge ${st.css} px-3 py-2`}>{st.label}</span>
                </div>

                {/* Acciones */}
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  {booking.status === 'pending' && (
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(booking._id)}>
                      Cancelar reserva
                    </button>
                  )}
                  {booking.status === 'completed' && !booking.review && (
                    <Link
                      to={`/reviews/nueva?bookingId=${booking._id}&roomId=${booking.roomId?._id || booking.roomId}`}
                      className="btn btn-outline-warning btn-sm"
                    >
                      ✍ Escribir review
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyBookingsPage