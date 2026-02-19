import { useState, useEffect } from 'react'
import { getOwnerBookings, updateBookingStatus } from '../services/bookingsService'

const STATUS_LABELS = {
  pending: { label: 'Pendiente', css: 'badge-pending' },
  confirmed: { label: 'Confirmada', css: 'badge-confirmed' },
  completed: { label: 'Completada', css: 'badge-completed' },
  cancelled: { label: 'Cancelada', css: 'badge-cancelled' },
}

const NEXT_OPTIONS_BY_STATUS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('pending')

  const [selectedById, setSelectedById] = useState({})
  const [savingById, setSavingById] = useState({})

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    setLoading(true)
    setError(null)
    try {
      const res = await getOwnerBookings()
      const list = res.data.bookings || res.data || []
      setBookings(list)

      setSelectedById(prev => {
        const next = { ...prev }
        for (const b of list) {
          if (next[b._id] === undefined) next[b._id] = b.status
        }
        return next
      })
    } catch {
      setError('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveStatus(booking) {
    const nextStatus = selectedById[booking._id]

    if (!nextStatus || nextStatus === booking.status) return

    const msg = `Cambiar estado: ${booking.status} -> ${nextStatus}. Continuar?`
    if (!confirm(msg)) return

    setSavingById(prev => ({ ...prev, [booking._id]: true }))
    try {
      await updateBookingStatus(booking._id, nextStatus)
      await fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el estado')
      setSelectedById(prev => ({ ...prev, [booking._id]: booking.status }))
    } finally {
      setSavingById(prev => ({ ...prev, [booking._id]: false }))
    }
  }

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  const visible = filter ? bookings.filter(b => b.status === filter) : bookings

  return (
    <div>
      <h2 className="fw-bold mb-4">Reservas recibidas</h2>

      <div className="row g-3 mb-4">
        {[
          { key: 'pending', label: 'Pendientes', color: 'warning' },
          { key: 'confirmed', label: 'Confirmadas', color: 'primary' },
          { key: 'completed', label: 'Completadas', color: 'success' },
        ].map(s => (
          <div className="col-md-4" key={s.key}>
            <div className={`card border-${s.color} text-center p-3`}>
              <div className={`fs-1 fw-bold text-${s.color}`}>{counts[s.key] || 0}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

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

      {loading && (
        <div className="spinner-wrap">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && visible.length === 0 && (
        <div className="empty-state">
          <p>No hay reservas{filter ? ' con este estado' : ''}.</p>
        </div>
      )}

      <div className="row g-3">
        {visible.map(booking => {
          const st = STATUS_LABELS[booking.status] || { label: booking.status, css: '' }
          const nextOptions = NEXT_OPTIONS_BY_STATUS[booking.status] || []
          const selected = selectedById[booking._id] ?? booking.status
          const saving = Boolean(savingById[booking._id])

          return (
            <div className="col-12" key={booking._id}>
              <div className="card p-3">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1">{booking.roomId?.title || 'Sala'}</h5>
                    <p className="text-muted small mb-1">
                      {booking.userId?.name || 'Usuario'} ·{' '}
                      {new Date(booking.scheduledAt).toLocaleString('es-ES')} ·{' '}
                      {booking.players} jugadores
                    </p>
                  </div>

                  <span className={`badge ${st.css} px-3 py-2`}>{st.label}</span>
                </div>

                <div className="mt-3">
                  {nextOptions.length === 0 ? (
                    <div className="text-muted small">
                      Esta reserva ya no admite cambios de estado.
                    </div>
                  ) : (
                    <div className="d-flex gap-2 flex-wrap align-items-end">
                      <div style={{ minWidth: 220 }}>
                        <label className="form-label mb-1">Cambiar estado</label>
                        <select
                          className="form-select"
                          value={selected}
                          onChange={(e) =>
                            setSelectedById(prev => ({ ...prev, [booking._id]: e.target.value }))
                          }
                        >
                          <option value={booking.status}>
                            Mantener: {STATUS_LABELS[booking.status]?.label || booking.status}
                          </option>

                          {nextOptions.map(s => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]?.label || s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        className="btn btn-primary"
                        disabled={saving || selected === booking.status}
                        onClick={() => handleSaveStatus(booking)}
                      >
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
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
