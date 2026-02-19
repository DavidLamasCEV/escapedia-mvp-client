import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRoomById, getRoomAvailability } from '../services/roomsService'
import { getReviewsByRoom } from '../services/reviewsService'
import { createBooking } from '../services/bookingsService'
import { useAuth } from '../contents/authContext'

function toISODateLocal(date) {
  // YYYY-MM-DD en hora local
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function RoomDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Reserva por slots
  const [selectedDate, setSelectedDate] = useState(() => toISODateLocal(new Date()))
  const [availability, setAvailability] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState(null)
  const [dayType, setDayType] = useState(null)
  const [slotDurationMin, setSlotDurationMin] = useState(null)

  // Formulario de reserva
  const [bookingForm, setBookingForm] = useState({ scheduledAt: '', players: 2 })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [bookingDone, setBookingDone] = useState(false)

  const mainImageUrl =
    room?.coverImageUrl ||
    (Array.isArray(room?.galleryImageUrls) ? room.galleryImageUrls[0] : null)

  useEffect(() => {
    async function loadData() {
      try {
        const [roomRes, reviewsRes] = await Promise.all([
          getRoomById(id),
          getReviewsByRoom(id)
        ])
        setRoom(roomRes.data.room || roomRes.data)
        setReviews(reviewsRes.data.reviews || reviewsRes.data || [])
      } catch {
        setError('No se pudo cargar la sala')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  useEffect(() => {
    async function loadAvailability() {
      setAvailabilityLoading(true)
      setAvailabilityError(null)
      setAvailability([])
      setDayType(null)
      setSlotDurationMin(null)

      // Resetea slot seleccionado si cambio la fecha
      setBookingForm(prev => ({ ...prev, scheduledAt: '' }))

      try {
        const res = await getRoomAvailability(id, selectedDate)
        const data = res.data

        setAvailability(data.availability || [])
        setDayType(data.dayType || null)
        setSlotDurationMin(data.slotDurationMin || null)
      } catch {
        setAvailabilityError('No se pudo cargar la disponibilidad para esa fecha')
      } finally {
        setAvailabilityLoading(false)
      }
    }

    loadAvailability()
  }, [id, selectedDate])

  async function handleBooking(e) {
    e.preventDefault()

    if (!user) {
      navigate('/login')
      return
    }

    if (!bookingForm.scheduledAt) {
      setBookingError('Selecciona un horario disponible')
      return
    }

    setBookingLoading(true)
    setBookingError(null)

    try {
      await createBooking({
        roomId: id,
        scheduledAt: bookingForm.scheduledAt, // UTC ISO con Z, devuelto por availability
        players: Number(bookingForm.players)
      })
      setBookingDone(true)
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Error al reservar')
    } finally {
      setBookingLoading(false)
    }
  }

  function renderStars(rating) {
    const full = Math.round(rating || 0)
    return '★'.repeat(full) + '☆'.repeat(5 - full)
  }

  function getSlotButtonText(a) {
    if (!a.available) return `${a.slot} (ocupado)`
    if (a.callRequired) return `${a.slot} (requiere llamada)`
    return a.slot
  }

  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner-border text-primary" role="status" />
    </div>
  )

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!room) return <div className="alert alert-warning">Sala no encontrada</div>

  return (
    <div>
      <div className="row g-4">
        {/* Columna principal */}
        <div className="col-lg-8">
          {/* Imagen portada */}
          {mainImageUrl ? (
            <img
              src={mainImageUrl}
              className="img-fluid rounded mb-4 w-100"
              style={{ maxHeight: 380, objectFit: 'cover' }}
              alt={room.title}
            />
          ) : (
            <div className="bg-secondary rounded d-flex align-items-center justify-content-center mb-4" style={{ height: 280 }}>
              <span className="text-white fs-1">🔐</span>
            </div>
          )}

          {/* Info */}
          <div className="mb-2">
            {room.themes?.map(t => <span key={t} className="badge bg-light text-dark border me-1">{t}</span>)}
          </div>
          <h1 className="fw-bold">{room.title}</h1>
          {room.localId && (
            <div className="mb-3 text-muted">
              <div className="fw-semibold">{room.localId.name}</div>
              <div className="small">
                {room.localId.city} · {room.localId.address}
              </div>
            </div>
          )}

          <p className="text-muted">
            ⭐ {room.ratingAvg?.toFixed(1)} ({room.ratingCount} valoraciones)
          </p>
          <p>{room.description}</p>

          <div className="row g-3 my-3">
            {[
              { label: '📍 Ciudad', value: room.city },
              { label: '⏱ Duración', value: `${room.durationMin} min` },
              { label: '👥 Jugadores', value: `${room.playersMin}–${room.playersMax}` },
              { label: '🎯 Dificultad', value: room.difficulty },
              { label: '💶 Precio desde', value: `${room.priceFrom}€` },
            ].map(item => (
              <div className="col-6 col-md-4" key={item.label}>
                <div className="card text-center p-2">
                  <small className="text-muted">{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <h4 className="mt-4 mb-3">Valoraciones</h4>
          {reviews.length === 0
            ? <p className="text-muted">Todavía no hay valoraciones. ¡Completa la sala y sé el primero!.</p>
            : reviews.map(r => (
                <div key={r._id} className="card mb-2 p-3">
                  <div className="d-flex justify-content-between">
                    <strong>{r.userId?.name || 'Usuario'}</strong>
                    <span className="text-warning">{renderStars(r.rating)}</span>
                  </div>
                  <p className="mb-0 mt-1 text-muted small">{r.comment}</p>
                </div>
              ))
          }
        </div>

        {/* Sidebar: reserva */}
        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: 80 }}>
            <div className="card-body">
              <h4 className="card-title">Reservar</h4>

              {bookingDone ? (
                <div>
                  <div className="alert alert-success">¡Reserva enviada!. En un plazo de 24/48 horas recibirás la confirmación por email.</div>
                  <Link to="/mis-reservas" className="btn btn-outline-primary w-100">Ver mis reservas</Link>
                </div>
              ) : (
                <form onSubmit={handleBooking}>
                  <div className="mb-3">
                    <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                    />
                    {(dayType || slotDurationMin) && (
                      <div className="text-muted small mt-1">
                        {dayType ? `Tipo de día: ${dayType}` : ''}
                        {dayType && slotDurationMin ? ' | ' : ''}
                        {slotDurationMin ? `Duración slot: ${slotDurationMin} min` : ''}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Horarios</label>

                    {availabilityLoading ? (
                      <div className="text-muted">Cargando disponibilidad...</div>
                    ) : availabilityError ? (
                      <div className="alert alert-danger">{availabilityError}</div>
                    ) : availability.length === 0 ? (
                      <div className="text-muted">No hay horarios para esta fecha.</div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {availability.map(a => {
                          const disabled = !a.available || a.callRequired
                          const isSelected = bookingForm.scheduledAt === a.scheduledAt

                          return (
                            <button
                              key={a.scheduledAt}
                              type="button"
                              className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                              disabled={disabled}
                              onClick={() => setBookingForm(prev => ({ ...prev, scheduledAt: a.scheduledAt }))}
                              title={disabled ? 'No disponible para reserva online' : 'Seleccionar horario'}
                            >
                              {getSlotButtonText(a)}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <div className="text-muted small mt-2">
                      Las reservas deben hacerse con al menos 12 horas de antelación.
                    </div>
                    <div className="text-muted small mt-2">
                      Si una reserva "Requiere llamada", contacta directamente con el local para reservar por teléfono.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Jugadores ({room.playersMin}–{room.playersMax})</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      min={room.playersMin}
                      max={room.playersMax}
                      value={bookingForm.players}
                      onChange={e => setBookingForm(prev => ({ ...prev, players: e.target.value }))}
                    />
                  </div>

                  {bookingError && <div className="alert alert-danger">{bookingError}</div>}

                  {user
                    ? <button type="submit" className="btn btn-primary w-100" disabled={bookingLoading}>
                        {bookingLoading ? 'Reservando...' : 'Confirmar reserva'}
                      </button>
                    : <button type="button" className="btn btn-outline-primary w-100" onClick={() => navigate('/login')}>
                        Inicia sesión para reservar
                      </button>
                  }

                  <p className="text-center text-muted small mt-2">
                    Desde <strong>{room.priceFrom}€</strong>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDetailPage
