import { useState, useEffect } from 'react'
import {
  createLocal,
  getMyLocales,
  getAllLocales,
  updateLocal,
  deleteLocal,
  uploadLocalCover,
  deleteLocalCover
} from '../services/localesService'
import { getOwners } from '../services/usersService'
import { useAuth } from '../contents/authContext'
import { Link } from 'react-router-dom'

const EMPTY = { name: '', city: '', address: '', phone: '', email: '', ownerId: '' }

function LocalesAdminPage() {
  const { user } = useAuth()

  const [locales, setLocales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Formulario crear
  const [form, setForm] = useState(EMPTY)
  const [formCoverFile, setFormCoverFile] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Owners para asignar
  const [owners, setOwners] = useState([])
  const [ownersError, setOwnersError] = useState(null)

  // Edicion inline
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', city: '', address: '', phone: '', email: '', ownerId: '' })
  const [editCoverFile, setEditCoverFile] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState(null)

  useEffect(() => { fetchLocales() }, [user?.role])
  useEffect(() => { if (user?.role === 'admin') fetchOwners() }, [user?.role])

  async function fetchLocales() {
    setLoading(true)
    setError(null)
    try {
      const res = (user?.role === 'admin') ? await getAllLocales() : await getMyLocales()
      setLocales(res.data.locales || res.data || [])
    } catch {
      setError('Error al cargar los locales')
    } finally {
      setLoading(false)
    }
  }

  async function fetchOwners() {
    setOwnersError(null)
    try {
      const res = await getOwners()
      setOwners(res.data.owners || [])
    } catch {
      setOwnersError('No se pudo cargar la lista de owners')
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleCreateCoverChange(e) {
    const file = e.target.files?.[0] || null
    setFormCoverFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(false)

    try {
      // 1) Crear el local (datos de texto)
      const res = await createLocal(form)

      // Intentamos sacar el _id sin depender de un único shape
      const created = res.data?.local || res.data?.locale || res.data
      const newId = created?._id

      // 2) Si hay imagen, subirla al endpoint de cover
      if (newId && formCoverFile) {
        await uploadLocalCover(newId, formCoverFile)
      }

      setForm(EMPTY)
      setFormCoverFile(null)
      setFormSuccess(true)
      setShowForm(false)
      fetchLocales()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear el local')
    } finally {
      setFormLoading(false)
    }
  }

  function startEdit(local) {
    setEditError(null)
    setEditingId(local._id)
    setEditCoverFile(null)

    const ownerId = local.ownerId?._id ? local.ownerId._id : (local.ownerId || '')

    setEditForm({
      name: local.name || '',
      city: local.city || '',
      address: local.address || '',
      phone: local.phone || '',
      email: local.email || '',
      ownerId: ownerId || ''
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
    setEditLoading(false)
    setEditCoverFile(null)
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  function handleEditCoverChange(e) {
    const file = e.target.files?.[0] || null
    setEditCoverFile(file)
  }

  async function submitEdit(e) {
    e.preventDefault()
    setEditLoading(true)
    setEditError(null)

    try {
      // 1) Actualizar campos de texto
      await updateLocal(editingId, editForm)

      // 2) Si se ha seleccionado una imagen, subir cover
      if (editCoverFile) {
        await uploadLocalCover(editingId, editCoverFile)
      }

      setEditingId(null)
      setEditCoverFile(null)
      fetchLocales()
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error al actualizar el local')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm('Vas a eliminar este local. Esta acción no se puede deshacer. Continuar?')
    if (!ok) return

    try {
      await deleteLocal(id)
      fetchLocales()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el local')
    }
  }

  async function handleDeleteCover(id) {
    const ok = window.confirm('Vas a quitar la imagen de portada de este local. Continuar?')
    if (!ok) return

    try {
      await deleteLocalCover(id)
      fetchLocales()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al quitar la portada')
    }
  }

  function getLocalCover(local) {
    // Si existe coverImageUrl en BD, se usa.
    // Si no existe, mantenemos el placeholder (Picsum) que ya estabais usando.
    return (
      local.coverImageUrl ||
      `https://picsum.photos/seed/local-${local._id}/800/450`
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Gestión de locales</h2>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setFormSuccess(false) }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo local'}
        </button>
      </div>

      {ownersError && <div className="alert alert-warning">{ownersError}</div>}

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
                <label className="form-label">Dirección *</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  required
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
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Imagen de portada (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleCreateCoverChange}
                />
                <div className="form-text">
                  Si no subes ninguna, se mostrará un placeholder automático.
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="col-12 mt-3">
                <label className="form-label">Owner</label>
                <select
                  name="ownerId"
                  className="form-select"
                  value={form.ownerId || ''}
                  onChange={handleChange}
                >
                  <option value="">Asignar a mí mismo</option>
                  {owners.map(o => (
                    <option key={o._id} value={o._id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Creando...' : 'Crear local'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => { setShowForm(false); setForm(EMPTY); setFormCoverFile(null) }}
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
          <p>No hay locales creados todavía.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear primer local
          </button>
        </div>
      )}

      <div className="row g-3">
        {locales.map(local => {
          const isEditing = editingId === local._id
          const coverUrl = getLocalCover(local)

          return (
            <div className="col-12" key={local._id}>
              <div className="card p-3">
                <div className="d-flex gap-3 align-items-center flex-wrap">
                  <img
                    src={coverUrl}
                    alt={local.name}
                    style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 8 }}
                  />

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <h5 className="mb-1">{local.name}</h5>
                        <p className="text-muted small mb-0">
                          {local.city}
                          {local.address && ` · ${local.address}`}
                          {local.phone && ` · ${local.phone}`}
                          {local.email && ` · ${local.email}`}
                        </p>
                      </div>
                      <span className="badge bg-light text-dark border">ID: {local._id.slice(-6)}</span>
                    </div>

                    {!isEditing && (
                      <div className="mt-3 d-flex gap-2 flex-wrap">
                        <Link
                          to={`/locales/${local._id}`}
                          className="btn btn-success"
                          target="_blank"
                        >
                          Ver en catálogo
                        </Link>

                        <button className="btn btn-warning" onClick={() => startEdit(local)}>
                          Editar
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(local._id)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3">
                    {editError && <div className="alert alert-danger">{editError}</div>}

                    <form onSubmit={submitEdit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Nombre</label>
                          <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={editForm.name}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Ciudad</label>
                          <input
                            type="text"
                            name="city"
                            className="form-control"
                            value={editForm.city}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label">Dirección</label>
                          <input
                            type="text"
                            name="address"
                            className="form-control"
                            value={editForm.address}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Teléfono</label>
                          <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            value={editForm.phone}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={editForm.email}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label">Nueva portada (opcional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={handleEditCoverChange}
                          />
                          <div className="form-text">
                            Si seleccionas una imagen, se subirá al guardar.
                          </div>

                          {local.coverImageUrl && (
                            <div className="mt-2">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteCover(local._id)}
                              >
                                Quitar portada
                              </button>
                            </div>
                          )}
                        </div>

                        {user?.role === 'admin' && (
                          <div className="col-12">
                            <label className="form-label">Owner (solo admin)</label>
                            <select
                              name="ownerId"
                              className="form-select"
                              value={editForm.ownerId}
                              onChange={handleEditChange}
                            >
                              <option value="">Sin owner</option>
                              {owners.map(o => (
                                <option key={o._id} value={o._id}>
                                  {o.name} ({o.email})
                                </option>
                              ))}
                            </select>
                            <div className="form-text">
                              Si no aparece nadie, revisa que existan usuarios con role "owner".
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={editLoading}>
                          {editLoading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LocalesAdminPage
