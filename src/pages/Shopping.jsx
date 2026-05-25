import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useShopping } from '../hooks/useShopping'
import AddItemModal from '../components/AddItemModal'
import StartTripModal from '../components/StartTripModal'

const relativeTime = (ts) => {
  if (!ts?.toMillis) return ''
  const s = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (s < 60) return 'ahora mismo'
  if (s < 3600) return `hace ${Math.floor(s / 60)}m`
  if (s < 86400) return `hace ${Math.floor(s / 3600)}h`
  return `hace ${Math.floor(s / 86400)}d`
}

export default function Shopping() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, activeTrip, loading, addItem, deleteItem, startTrip } = useShopping()
  const [showAdd, setShowAdd] = useState(false)
  const [showStart, setShowStart] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [successMsg, setSuccessMsg] = useState(!!location.state?.success)

  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(false), 4000)
    return () => clearTimeout(t)
  }, [successMsg])

  const handleAdd = async (name, comment) => {
    await addItem(name, comment)
    setShowAdd(false)
  }

  const handleStart = async (store) => {
    await startTrip(store)
    navigate('/shopping/active')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-4 pb-4 pt-12 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Lista de la compra</h1>
          <Link to="/shopping/history" className="text-sm font-medium text-indigo-600">
            Historial
          </Link>
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4">
        {successMsg && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            ✅ Compra finalizada — la lista ha sido actualizada
          </div>
        )}

        {activeTrip && (
          <div className="rounded-2xl bg-indigo-600 p-4">
            <p className="text-sm font-medium text-indigo-200">Compra en curso</p>
            <p className="text-lg font-bold text-white">🛒 {activeTrip.store}</p>
            <button
              onClick={() => navigate('/shopping/active')}
              className="mt-3 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-indigo-600"
            >
              Continuar compra
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-14 text-center">
            <p className="text-gray-400">La lista está vacía.</p>
            <p className="mt-1 text-sm text-gray-400">Pulsa + para añadir el primer producto.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    {item.addedByName} · {relativeTime(item.createdAt)}
                  </p>
                </div>
                {item.comment && (
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="shrink-0 text-lg"
                  >
                    💬
                  </button>
                )}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="shrink-0 text-gray-300 transition-colors hover:text-red-400"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              {expandedId === item.id && item.comment && (
                <p className="mt-2 border-t border-gray-100 pt-2 text-sm text-gray-500">
                  {item.comment}
                </p>
              )}
            </div>
          ))
        )}

        {!activeTrip && items.length > 0 && (
          <button
            onClick={() => setShowStart(true)}
            className="w-full rounded-2xl bg-indigo-600 py-4 font-semibold text-white"
          >
            🛒 Iniciar compra
          </button>
        )}
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-lg"
      >
        +
      </button>

      {showAdd && <AddItemModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
      {showStart && <StartTripModal onStart={handleStart} onClose={() => setShowStart(false)} />}
    </div>
  )
}
