import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/authService'

function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await forgotPassword({ email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="card-title mb-4 text-center">Recuperar contraseña</h2>

            {success ? (
              <div>
                <div className="alert alert-success">
                  ✅ Email enviado. Revisa tu bandeja de entrada.
                </div>
                <Link to="/login" className="btn btn-outline-secondary w-100">
                  Volver al login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-muted small mb-3">
                  Introduce tu email y te enviaremos un enlace para restablecer la contraseña.
                </p>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
                <div className="mt-3 text-center">
                  <Link to="/login" className="small text-muted">← Volver al login</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage