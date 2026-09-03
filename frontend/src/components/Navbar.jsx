import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? 'text-rose-600'
        : 'text-gray-500 hover:text-rose-600'
    }`

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-pink-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-rose-600">MiniTaskManager</h1>
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Tareas
          </Link>
          <Link to="/wp-posts" className={linkClass('/wp-posts')}>
            WordPress
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.user}
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}
