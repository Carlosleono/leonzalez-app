import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useShopping } from '../hooks/useShopping'
import { logoutUser } from '../firebase/auth'

export default function Home() {
  const { userProfile, familyId } = useAuth()
  const { activeTrip } = useShopping()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-6xl">🏠</div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Hola, {userProfile?.name}
          </h1>
          <div className="inline-block rounded-full bg-indigo-50 px-4 py-1.5">
            <span className="font-mono text-sm font-semibold text-indigo-600">
              Código: {familyId}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {activeTrip && (
            <div className="rounded-2xl bg-indigo-600 p-4">
              <p className="text-sm font-medium text-indigo-200">Compra en curso</p>
              <p className="font-bold text-white">🛒 {activeTrip.store}</p>
              <button
                onClick={() => navigate('/shopping/active')}
                className="mt-2 w-full rounded-xl bg-white py-2 text-sm font-semibold text-indigo-600"
              >
                Continuar compra
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/shopping')}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <span className="text-3xl">🛒</span>
            <div>
              <p className="font-semibold text-gray-900">Lista de la compra</p>
              <p className="text-sm text-gray-500">Gestiona los productos pendientes</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-10 w-full text-center text-sm text-gray-400 hover:text-gray-600"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
