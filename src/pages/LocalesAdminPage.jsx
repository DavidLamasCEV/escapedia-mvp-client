import { useState, useEffect } from 'react'
import { createLocal, getMyLocales } from '../services/localesService'

const EMPTY = {
  name: '', city: '', address: '', phone: '', email: ''
}

function LocalesAdminPage() {
  const [locales, setLocales]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Formulario
  const [form, setForm]         = useState(EMPTY)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]     = useState(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchLocales() }, [])

  async function fetchLocales() {
    setLoading(true)
    try {
      const res = await getMyLocales()
      setLocales(res.data.locales || res.data || [])
    } catch {
      setError('Error al cargar los locales')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(false)
    try {
      await createLocal(form)
      setForm(EMPTY)
      setFormSuccess(true)
      setShowForm(false)
      fetchLocales() // recarga la lista
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear el local')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">🏢 Gestión de locales</h2>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setFormSuccess(false) }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo local'}
        </button>
      </div>

      {/* Mensaje de éxito tras crear */}
      {formSuccess && (
        <div className="alert alert-success alert-dismissible">
          ✅ Local creado correctamente.
          <button type="button" className="btn-close" onClick={() => setFormSuccess(false)} />
        </div>
      )}

      {/* Formulario de creación */}
      {showForm && (
        <div className="card p-4 mb-4 shadow-sm">
          <h5 className="mb-3">Nuevo local</h5>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="ej. Escapedia Madrid Centro"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Ciudad *</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  placeholder="ej. Madrid"
                  required
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="ej. Calle Gran Vía 42, 1º"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="ej. 912 345 678"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email de contacto</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="ej. info@escapedia.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Creando...' : 'Crear local'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => { setShowForm(false); setForm(EMPTY) }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de locales */}
      {loading && (
        <div className="spinner-wrap">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && locales.length === 0 && (
        <div className="empty-state">
          <p>No hay locales creados todavía.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear primer local
          </button>
        </div>
      )}

      <div className="row g-3">
        {locales.map(local => (
          <div className="col-12" key={local._id}>
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h5 className="mb-1">🏢 {local.name}</h5>
                  <p className="text-muted small mb-0">
                    📍 {local.city}
                    {local.address && ` · ${local.address}`}
                    {local.phone   && ` · 📞 ${local.phone}`}
                    {local.email   && ` · ✉ ${local.email}`}
                  </p>
                </div>
                <span className="badge bg-light text-dark border">ID: {local._id.slice(-6)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocalesAdminPage