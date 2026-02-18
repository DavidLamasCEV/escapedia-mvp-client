import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createLocal, getMyLocales } from '../services/localesService'

const EMPTY = { name: '', city: '', address: '' }

function LocalesOwnerPage() {
  const [locales, setLocales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(false)

  useEffect(() => { fetchLocales() }, [])

  async function fetchLocales() {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyLocales()
      setLocales(res.data.locales || [])
    } catch {
      setError('Error al cargar tus locales')
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
      fetchLocales()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear el local')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Mis locales</h2>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setFormSuccess(false) }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo local'}
        </button>
      </div>

      {formSuccess && (
        <div className="alert alert-success alert-dismissible">
          Local creado correctamente.
          <button type="button" className="btn-close" onClick={() => setFormSuccess(false)} />
        </div>
      )}

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
                  required
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Direccion *</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  required
                  value={form.address}
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

      {loading && (
        <div className="spinner-wrap">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && locales.length === 0 && (
        <div className="empty-state">
          <p>No tienes locales creados todavia.</p>
        </div>
      )}

      <div className="row g-3">
        {locales.map(local => (
          <div className="col-12" key={local._id}>
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h5 className="mb-1">{local.name}</h5>
                  <p className="text-muted small mb-0">
                    {local.city}
                    {local.address && ` · ${local.address}`}
                  </p>
                </div>
                <span className="badge bg-light text-dark border">ID: {local._id.slice(-6)}</span>
              </div>

              <div className="mt-3 d-flex gap-2">
                <Link className="btn btn-outline-primary" to={`/locales/${local._id}`}>
                  Ver detalle
                </Link>
              </div>

              <div className="mt-2 small text-muted">
                Nota: como owner, puedes ver tus locales y su detalle, pero no puedes editarlos ni borrarlos desde el frontend.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocalesOwnerPage
