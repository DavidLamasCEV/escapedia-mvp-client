import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRoomById, createRoom, updateRoom } from '../services/roomsService'
import { getMyLocales, createLocal } from '../services/localesService'

const EMPTY = {
  title: '', description: '', city: '', difficulty: 'medium',
  durationMin: 60, playersMin: 2, playersMax: 6, priceFrom: 15,
  localId: '', themes: []
}

function RoomFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm]         = useState(EMPTY)
  const [themeInput, setThemeInput] = useState('')
  const [imageBase64, setImageBase64] = useState(null)
  const [preview, setPreview]   = useState(null)
  const [locales, setLocales]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  // Cargar locales y sala (si editamos)
  useEffect(() => {
    getMyLocales()
      .then(res => setLocales(res.data.locales || res.data || []))
      .catch(() => {})

    if (isEdit) {
      getRoomById(id).then(res => {
        const room = res.data.room || res.data
        setForm({
          title: room.title, description: room.description, city: room.city,
          difficulty: room.difficulty, durationMin: room.durationMin,
          playersMin: room.playersMin, playersMax: room.playersMax,
          priceFrom: room.priceFrom, themes: room.themes || [],
          localId: room.localId?._id || room.localId || ''
        })
        if (room.coverImageUrl) setPreview(room.coverImageUrl)
      }).catch(() => setError('Error al cargar la sala'))
    }
  }, [id, isEdit])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageBase64(reader.result)
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function addTheme() {
    const t = themeInput.trim()
    if (!t || form.themes.includes(t)) return
    setForm({ ...form, themes: [...form.themes, t] })
    setThemeInput('')
  }

  function removeTheme(t) {
    setForm({ ...form, themes: form.themes.filter(x => x !== t) })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = { ...form }
      if (imageBase64) payload.coverImageBase64 = imageBase64

      if (isEdit) {
        await updateRoom(id, payload)
      } else {
        await createRoom(payload)
      }
      navigate('/owner/salas')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{isEdit ? '✏ Editar sala' : '+ Nueva sala'}</h2>
        <Link to="/owner/salas" className="btn btn-outline-secondary btn-sm">← Volver</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Local */}
          <div className="col-12">
            <div className="card p-3">
              <h5>Local / Venue</h5>
              <select name="localId" className="form-select" required value={form.localId} onChange={handleChange}>
                <option value="">-- Selecciona un local --</option>
                {locales.map(l => <option key={l._id} value={l._id}>{l.name} ({l.city})</option>)}
              </select>
              <small className="text-muted mt-1 d-block">
                Si no tienes locales todavía, <Link to="/owner/salas">créalos desde el panel</Link>.
              </small>
            </div>
          </div>

          {/* Info */}
          <div className="col-12">
            <div className="card p-3">
              <h5 className="mb-3">Información</h5>
              <div className="mb-3">
                <label className="form-label">Título *</label>
                <input type="text" name="title" className="form-control" required value={form.title} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción *</label>
                <textarea name="description" className="form-control" rows={3} required value={form.description} onChange={handleChange} />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Ciudad *</label>
                  <input type="text" name="city" className="form-control" required value={form.city} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Dificultad *</label>
                  <select name="difficulty" className="form-select" value={form.difficulty} onChange={handleChange}>
                    <option value="easy">Fácil</option>
                    <option value="medium">Media</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Duración (min)</label>
                  <input type="number" name="durationMin" className="form-control" min={15} value={form.durationMin} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Precio desde (€)</label>
                  <input type="number" name="priceFrom" className="form-control" min={0} step={0.5} value={form.priceFrom} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Jugadores mín</label>
                  <input type="number" name="playersMin" className="form-control" min={1} value={form.playersMin} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Jugadores máx</label>
                  <input type="number" name="playersMax" className="form-control" min={1} value={form.playersMax} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Temáticas */}
          <div className="col-12">
            <div className="card p-3">
              <h5>Temáticas</h5>
              <div className="d-flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="ej. Terror, Aventura..."
                  value={themeInput}
                  onChange={e => setThemeInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTheme() } }}
                />
                <button type="button" className="btn btn-outline-secondary" onClick={addTheme}>Añadir</button>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {form.themes.map(t => (
                  <span key={t} className="badge bg-light text-dark border d-flex align-items-center gap-1">
                    {t}
                    <button type="button" className="btn-close btn-close-sm" style={{ fontSize: '0.5rem' }} onClick={() => removeTheme(t)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="col-12">
            <div className="card p-3">
              <h5>Imagen de portada</h5>
              {preview && <img src={preview} className="img-fluid rounded mb-3" style={{ maxHeight: 200, objectFit: 'cover' }} alt="Preview" />}
              <input type="file" accept="image/*" className="form-control" onChange={handleImage} />
              {isEdit && <small className="text-muted mt-1 d-block">Sube una imagen nueva para reemplazar la actual</small>}
            </div>
          </div>

          {/* Submit */}
          <div className="col-12">
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear sala'}
              </button>
              <Link to="/owner/salas" className="btn btn-outline-secondary">Cancelar</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default RoomFormPage