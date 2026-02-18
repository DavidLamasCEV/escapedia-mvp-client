import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { createReview } from '../services/reviewsService'

function CreateReviewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const bookingId = searchParams.get('bookingId')
  const roomId    = searchParams.get('roomId')

  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) { setError('Selecciona una puntuación'); return }
    setLoading(true)
    setError(null)
    try {
      await createReview({ bookingId, roomId, rating, comment })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar la review')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingId || !roomId) return (
    <div className="alert alert-danger">
      Faltan parámetros. <Link to="/mis-reservas">Volver a mis reservas</Link>
    </div>
  )

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2 className="fw-bold mb-4">✍ Escribir valoración</h2>

        {success ? (
          <div>
            <div className="alert alert-success">✅ Valoración publicada. ¡Gracias!</div>
            <Link to="/mis-reservas" className="btn btn-primary">Ver mis reservas</Link>
          </div>
        ) : (
          <div className="card p-4 shadow-sm">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              {/* Estrellas */}
              <div className="mb-3">
                <label className="form-label">Puntuación</label>
                <div className="d-flex gap-2 fs-3">
                  {[1,2,3,4,5].map(n => (
                    <span
                      key={n}
                      style={{ cursor: 'pointer', color: n <= rating ? '#ffc107' : '#dee2e6' }}
                      onClick={() => setRating(n)}
                    >★</span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Comentario</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Cuéntanos tu experiencia..."
                  required
                  minLength={10}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publicando...' : 'Publicar valoración'}
                </button>
                <Link to="/mis-reservas" className="btn btn-outline-secondary">Cancelar</Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateReviewPage