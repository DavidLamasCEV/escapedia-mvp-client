import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createRoom, getRoomById, updateRoom } from '../services/roomsService'

function isValidHHmm(value) {
  // 00:00 a 23:59
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

function normalizeSlot(value) {
  return value.trim()
}

function RoomFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [weekSlotInput, setWeekSlotInput] = useState('')
  const [weekendSlotInput, setWeekendSlotInput] = useState('')

  const [form, setForm] = useState({
    localId: '',
    title: '',
    description: '',
    city: '',
    themesText: '',
    difficulty: 'easy',
    durationMin: 60,
    playersMin: 2,
    playersMax: 6,
    priceFrom: 60,

    slotDurationMin: 60,
    weekSlots: [],
    weekendSlots: [],
  })

  const themes = useMemo(() => {
    const parts = (form.themesText || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    return Array.from(new Set(parts))
  }, [form.themesText])

  useEffect(() => {
    if (!isEdit) return

    async function loadRoom() {
      setLoading(true)
      setError(null)

      try {
        const res = await getRoomById(id)
        const room = res.data.room || res.data

        setForm(prev => ({
          ...prev,
          localId: room.localId?._id || room.localId || '',
          title: room.title || '',
          description: room.description || '',
          city: room.city || '',
          themesText: Array.isArray(room.themes) ? room.themes.join(', ') : '',
          difficulty: room.difficulty || 'easy',
          durationMin: room.durationMin || 60,
          playersMin: room.playersMin || 2,
          playersMax: room.playersMax || 6,
          priceFrom: room.priceFrom || 60,

          slotDurationMin: room.slotDurationMin || 60,
          weekSlots: Array.isArray(room.weekSlots) ? room.weekSlots : [],
          weekendSlots: Array.isArray(room.weekendSlots) ? room.weekendSlots : [],
        }))
      } catch {
        setError('No se pudo cargar la sala para editar')
      } finally {
        setLoading(false)
      }
    }

    loadRoom()
  }, [id, isEdit])

  function setField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function addWeekSlot() {
    const slot = normalizeSlot(weekSlotInput)
    if (!isValidHHmm(slot)) {
      setError('Hora invalida. Formato esperado: HH:mm')
      return
    }

    setError(null)
    setForm(prev => {
      if (prev.weekSlots.includes(slot)) return prev
      const next = [...prev.weekSlots, slot].sort()
      return { ...prev, weekSlots: next }
    })
    setWeekSlotInput('')
  }

  function removeWeekSlot(slot) {
    setForm(prev => ({ ...prev, weekSlots: prev.weekSlots.filter(s => s !== slot) }))
  }

  function addWeekendSlot() {
    const slot = normalizeSlot(weekendSlotInput)
    if (!isValidHHmm(slot)) {
      setError('Hora invalida. Formato esperado: HH:mm')
      return
    }

    setError(null)
    setForm(prev => {
      if (prev.weekendSlots.includes(slot)) return prev
      const next = [...prev.weekendSlots, slot].sort()
      return { ...prev, weekendSlots: next }
    })
    setWeekendSlotInput('')
  }

  function removeWeekendSlot(slot) {
    setForm(prev => ({ ...prev, weekendSlots: prev.weekendSlots.filter(s => s !== slot) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!form.localId) throw new Error('localId es obligatorio')
      if (!form.title.trim()) throw new Error('El titulo es obligatorio')
      if (!form.city.trim()) throw new Error('La ciudad es obligatoria')
      if (Number(form.playersMin) > Number(form.playersMax)) {
        throw new Error('playersMin no puede ser mayor que playersMax')
      }
      if (form.weekSlots.length === 0) throw new Error('Añade al menos un horario entre semana (weekSlots)')
      if (form.weekendSlots.length === 0) throw new Error('Añade al menos un horario de fin de semana (weekendSlots)')

      const payload = {
        localId: form.localId,
        title: form.title.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        themes,
        difficulty: form.difficulty,
        durationMin: Number(form.durationMin),
        playersMin: Number(form.playersMin),
        playersMax: Number(form.playersMax),
        priceFrom: Number(form.priceFrom),

        slotDurationMin: Number(form.slotDurationMin),
        weekSlots: form.weekSlots,
        weekendSlots: form.weekendSlots,
      }

      if (isEdit) {
        await updateRoom(id, payload)
      } else {
        await createRoom(payload)
      }

      navigate('/owner/rooms')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'No se pudo guardar la sala'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="container py-4">Cargando...</div>

  return (
    <div className="container py-4">
      <h1 className="mb-3">{isEdit ? 'Editar sala' : 'Crear sala'}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">localId</label>
            <input
              className="form-control"
              value={form.localId}
              onChange={(e) => setField('localId', e.target.value)}
              placeholder="ID del local"
              required
            />
            <div className="form-text">
              De momento es un id manual. Mas adelante lo conectamos a /locales/mine.
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Ciudad</label>
            <input
              className="form-control"
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Titulo</label>
            <input
              className="form-control"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Descripcion</label>
            <textarea
              className="form-control"
              rows={4}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Dificultad</label>
            <select
              className="form-select"
              value={form.difficulty}
              onChange={(e) => setField('difficulty', e.target.value)}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Duracion (min)</label>
            <input
              type="number"
              className="form-control"
              min={15}
              value={form.durationMin}
              onChange={(e) => setField('durationMin', e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Precio desde (EUR)</label>
            <input
              type="number"
              className="form-control"
              min={0}
              value={form.priceFrom}
              onChange={(e) => setField('priceFrom', e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Jugadores min</label>
            <input
              type="number"
              className="form-control"
              min={1}
              value={form.playersMin}
              onChange={(e) => setField('playersMin', e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Jugadores max</label>
            <input
              type="number"
              className="form-control"
              min={1}
              value={form.playersMax}
              onChange={(e) => setField('playersMax', e.target.value)}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Tematicas (separadas por comas)</label>
            <input
              className="form-control"
              value={form.themesText}
              onChange={(e) => setField('themesText', e.target.value)}
              placeholder="misterio, terror, aventura"
            />
          </div>

          <div className="col-12">
            <hr />
            <h3 className="mb-2">Horarios</h3>
            <div className="form-text mb-3">
              Estos campos son necesarios para que el endpoint /rooms/:id/availability funcione correctamente.
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Duracion slot (min)</label>
            <input
              type="number"
              className="form-control"
              min={15}
              value={form.slotDurationMin}
              onChange={(e) => setField('slotDurationMin', e.target.value)}
            />
          </div>

          <div className="col-md-8">
            <label className="form-label">Horarios entre semana (weekSlots)</label>
            <div className="d-flex gap-2">
              <input
                className="form-control"
                value={weekSlotInput}
                onChange={(e) => setWeekSlotInput(e.target.value)}
                placeholder="HH:mm"
              />
              <button type="button" className="btn btn-outline-primary" onClick={addWeekSlot}>
                Añadir
              </button>
            </div>
            <div className="mt-2 d-flex flex-wrap gap-2">
              {form.weekSlots.map(slot => (
                <button
                  type="button"
                  key={slot}
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => removeWeekSlot(slot)}
                  title="Eliminar"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-8">
            <label className="form-label">Horarios fin de semana (weekendSlots)</label>
            <div className="d-flex gap-2">
              <input
                className="form-control"
                value={weekendSlotInput}
                onChange={(e) => setWeekendSlotInput(e.target.value)}
                placeholder="HH:mm"
              />
              <button type="button" className="btn btn-outline-primary" onClick={addWeekendSlot}>
                Añadir
              </button>
            </div>
            <div className="mt-2 d-flex flex-wrap gap-2">
              {form.weekendSlots.map(slot => (
                <button
                  type="button"
                  key={slot}
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => removeWeekendSlot(slot)}
                  title="Eliminar"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 d-flex gap-2 mt-3">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={() => navigate(-1)} disabled={saving}>
              Volver
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default RoomFormPage
