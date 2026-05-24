import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../firebase/auth'

export default function Home() {
  const { userProfile, familyId } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 text-6xl">🏠</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Hola, {userProfile?.name}
        </h1>
        <p className="mb-4 text-gray-500">Tu hogar familiar está listo</p>
        <div className="mb-8 inline-block rounded-full bg-indigo-50 px-4 py-1.5">
          <span className="font-mono text-sm font-semibold text-indigo-600">
            Código: {familyId}
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6 text-left">
          <p className="text-sm text-gray-500">
            Aquí irán los módulos: lista de la compra, finanzas, bebé…
            ¡Próximamente en el Sprint 2!
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 text-sm text-gray-400 hover:text-gray-600"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
