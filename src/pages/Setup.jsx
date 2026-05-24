import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createFamily, joinFamily, getFirebaseError } from '../firebase/auth'

export default function Setup() {
  const { user, setFamilyId } = useAuth()
  const navigate = useNavigate()
  const [createdCode, setCreatedCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setError('')
    setLoading(true)
    try {
      const familyId = await createFamily(user.uid)
      setFamilyId(familyId)
      setCreatedCode(familyId)
    } catch (err) {
      setError(getFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const familyId = await joinFamily(user.uid, joinCode)
      setFamilyId(familyId)
      navigate('/')
    } catch (err) {
      setError(getFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  if (createdCode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 text-5xl">🏠</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">¡Hogar creado!</h2>
          <p className="mb-6 text-gray-500">
            Comparte este código con tu pareja para que se una:
          </p>
          <div className="mb-6 rounded-2xl bg-indigo-50 px-6 py-8">
            <span className="font-mono text-5xl font-bold tracking-widest text-indigo-600">
              {createdCode}
            </span>
          </div>
          <p className="mb-8 text-sm text-gray-400">
            Guarda este código — lo necesitarás para invitar a tu pareja.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Continuar a la app
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Configura tu hogar
        </h1>
        <p className="mb-8 text-center text-gray-500">
          Crea uno nuevo o únete al de tu pareja
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Opción A: Crear */}
        <div className="mb-4 rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Crear un nuevo hogar
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Serás el primero. Se generará un código para invitar a tu pareja.
          </p>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creando…' : 'Crear hogar'}
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">o</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Opción B: Unirse */}
        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Unirte a un hogar existente
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Introduce el código de 6 caracteres que te ha compartido tu pareja.
          </p>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              required
              placeholder="AB1234"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-mono text-xl font-bold uppercase tracking-widest text-gray-900 placeholder-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              disabled={loading || joinCode.length < 6}
              className="w-full rounded-lg border-2 border-indigo-600 py-3 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50"
            >
              {loading ? 'Uniéndose…' : 'Unirme al hogar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
