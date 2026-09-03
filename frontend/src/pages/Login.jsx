import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ user: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-100 px-4">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur rounded-3xl shadow-[0_10px_40px_rgba(244,114,182,0.15)] border border-pink-100 p-8">
        <h1 className="text-2xl font-bold text-rose-600 mb-6 text-center">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="user" className="text-sm font-medium text-gray-600">
              Usuario
            </label>
            <input
              id="user"
              name="user"
              type="text"
              value={form.user}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu_usuario"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-600">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors shadow-sm"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-rose-600 hover:text-rose-700 hover:underline font-medium">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  )
}
