import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLocalById } from '../services/localesService'
import { useAuth } from '../contents/authContext'

function LocalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [local, setLocal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchLocal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchLocal() {
    setLoading(true)
    setError(null)

    try {
      const res = await getLocalById(id)
      setLocal(res.data.local || null)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar el local'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function ownerLabel() {
    if (!local?.ownerId) return 'Sin owner'
    if (typeof local.ownerId === 'object') {
      const o = local.ownerId
      return `${o.name} (${o.email})`
    }
    return String(local.ownerId)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Detalle del local</h2>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            Volver
          </button>

          {isAdmin && (
            <Link className="btn btn-outline-primary" to="/admin/locales">
              Ir a Administracion
            </Link>
          )}

          {!isAdmin && (
            <Link className="btn btn-outline-primary" to="/owner/locales">
              Ir a Mis locales
            </Link>
          )}
        </div>
      </div>

      {loading && (
        <div className="spinner-wrap">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && !local && (
        <div className="alert alert-warning">Local no encontrado.</div>
      )}

      {!loading && !error && local && (
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h4 className="mb-1">{local.name}</h4>
              <div className="text-muted small">
                {local.city}
                {local.address ? ` · ${local.address}` : ''}
              </div>
              <div className="small text-muted mt-2">Owner: {ownerLabel()}</div>
            </div>
            <span className="badge bg-light text-dark border">ID: {local._id}</span>
          </div>

        </div>
      )}
    </div>
  )
}

export default LocalDetailPage
