import { useEffect, useState } from 'react'
import { useAuth } from '../contents/authContext'
import { getMyTrophies } from '../services/trophiesService'

function ProfilePage() {
  const { user } = useAuth()
  const [trophies, setTrophies] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getMyTrophies()
      .then(res => setTrophies(res.data.trophies || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="row g-4">
      {/* Datos del usuario */}
      <div className="col-md-4">
        <div className="card shadow-sm text-center p-4">
          <div className="mb-3">
            {user.avatarUrl
              ? <img src={user.avatarUrl} className="rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} alt={user.name} />
              : <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto fw-bold fs-3"
                     style={{ width: 80, height: 80 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
            }
          </div>
          <h4 className="fw-bold">{user.name}</h4>
          <p className="text-muted small">{user.email}</p>
          <span className="badge bg-secondary text-capitalize">{user.role}</span>

          <hr />
          <p className="small text-muted mb-1">
            Email verificado: {user.isEmailVerified ? '✅' : '❌'}
          </p>
        </div>
      </div>

      {/* Trofeos */}
      <div className="col-md-8">
        <h4 className="fw-bold mb-3">🏆 Mis trofeos</h4>

        {loading && (
          <div className="spinner-wrap">
            <div className="spinner-border text-warning" role="status" />
          </div>
        )}

        {!loading && trophies.length === 0 && (
          <div className="empty-state">
            <p>Todavía no has desbloqueado ningún trofeo.</p>
            <p className="text-muted small">Completa reservas para ganar logros.</p>
          </div>
        )}

        <div className="row g-3">
          {trophies.map(ut => {
            const trophy = ut.trophyId || ut
            return (
              <div className="col-sm-6 col-lg-4" key={ut._id}>
                <div className="card text-center p-3 h-100">
                  <div className="fs-1">🏆</div>
                  <h6 className="fw-bold mt-2">{trophy.title}</h6>
                  <p className="text-muted small">{trophy.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage