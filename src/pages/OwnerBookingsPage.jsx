import { useState, useEffect } from 'react'
import { getOwnerBookings, confirmBooking, completeBooking, cancelBookingOwner } from '../services/bookingsService'

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',  css: 'badge-pending' },
  confirmed: { label: 'Confirmada', css: 'badge-confirmed' },
  completed: { label: 'Completada', css: 'badge-completed' },
  cancelled: { label: 'Cancelada',  css: 'badge-cancelled' },
}

function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [filter, setFilter]     = useState('pending')

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    setLoading(true)
    try {
      const res = await getOwnerBookings()
      setBookings(res.data.bookings || res.data || [])
    } catch {
      setError('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action, id) {
    const msgs = { confirm: '¿Confirmar reserva?', complete: '¿Marcar como completada?', cancel: '¿Cancelar reserva?' }
    if (!confirm(msgs[action])) return
    try {
      if (action === 'confirm')  await confirmBooking(id)
      if (action === 'complete') await completeBooking(id)
      if (action === 'cancel')   await cancelBookingOwner(id)
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar')
    }
  }

  // Contadores rápidos por estado
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  const visible = filter ? bookings.filter(b => b.status === filter) : bookings

  return (
    <div>
      <h2 className="fw-bold mb-4">📋 Reservas recibidas</h2>

      {/* Resumen */}
      <div className="row g-3 mb-4">
        {[
          { key: 'pending',   icon: '⏳', label: 'Pendientes',  color: 'warning' },
          { key: 'confirmed', icon: '✅', label: 'Confirmadas', color: 'primary' },
          { key: 'completed', icon: '🏁', label: 'Completadas', color: 'success' },
        ].map(s => (
          <div className="col-md-4" key={s.key}>
            <div className={`card border-${s.color} text-center p-3`}>
              <div className="fs-2">{s.icon}</div>
              <div className={`fs-1 fw-bold text-${s.color}`}>{counts[s.key] || 0}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s === '' ? 'Todas' : STATUS_LABELS[s]?.label}
            {s && counts[s] ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner-border text-primary" role="status" /></div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && visible.length === 0 && (
        <div className="empty-state">
          <p>No hay reservas{filter ? ' con este estado' : ''}.</p>
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
                      👤 {booking.userId?.name || 'Usuario'} &nbsp;·&nbsp;
                      📅 {new Date(booking.scheduledAt).toLocaleString('es-ES')} &nbsp;·&nbsp;
                      👥 {booking.players} jugadores
                    </p>
                  </div>
                  <span className={`badge ${st.css} px-3 py-2`}>{st.label}</span>
                </div>

                {/* Botones de workflow */}
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  {booking.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => handleAction('confirm', booking._id)}>
                        ✅ Confirmar
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleAction('cancel', booking._id)}>
                        Cancelar
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAction('complete', booking._id)}>
                        🏁 Marcar completada
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleAction('cancel', booking._id)}>
                        Cancelar
                      </button>
                    </>
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

export default OwnerBookingsPage
