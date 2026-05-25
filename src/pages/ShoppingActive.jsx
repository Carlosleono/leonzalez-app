import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useShopping } from '../hooks/useShopping'
import { subscribeToTripItems } from '../firebase/shopping'
import AddItemModal from '../components/AddItemModal'

export default function ShoppingActive() {
  const { familyId } = useAuth()
  const navigate = useNavigate()
  const { activeTrip, addItemToTrip, toggleItem, finishTrip } = useShopping()

  const [tripItems, setTripItems] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [ticketFile, setTicketFile] = useState(null)
  const [ticketPreview, setTicketPreview] = useState(null)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (activeTrip === null) navigate('/shopping', { replace: true })
  }, [activeTrip, navigate])

  useEffect(() => {
    if (!familyId || !activeTrip?.id) return
    return subscribeToTripItems(familyId, activeTrip.id, setTripItems)
  }, [familyId, activeTrip?.id])

  if (!activeTrip) return null

  const checked = tripItems.filter((i) => i.checked).length
  const total = tripItems.length
  const progress = total > 0 ? (checked / total) * 100 : 0
  const sortedItems = [...tripItems].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1
    return a.name.localeCompare(b.name, 'es')
  })

  const handleTicket = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setTicketFile(file)
    setTicketPreview(URL.createObjectURL(file))
  }

  const handleFinish = async () => {
    setFinishing(true)
    setError('')
    try {
      await finishTrip(ticketFile)
      navigate('/shopping', { state: { success: true }, replace: true })
    } catch {
      setError('Error al finalizar. Inténtalo de nuevo.')
      setFinishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-52">
      {/* Header */}
      <div className="bg-white px-4 pb-4 pt-12 shadow-sm">
        <button onClick={() => navigate('/shopping')} className="mb-2 text-sm text-gray-400">
          ← Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900">{activeTrip.store}</h1>
        <p className="text-sm text-gray-500">{checked} de {total} productos cogidos</p>
        <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 px-4 pt-4">
        {sortedItems.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id, !item.checked)}
            className={`w-full rounded-2xl px-4 py-3.5 text-left shadow-sm transition-colors ${
              item.checked ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                item.checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
              }`}>
                {item.checked && (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {item.name}
                </p>
                {item.comment && !item.checked && (
                  <p className="text-xs text-gray-400">💬 {item.comment}</p>
                )}
              </div>
              {item.addedDuringTrip && (
                <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  Añadido aquí
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* FAB añadir durante compra */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-48 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-xl text-indigo-600 shadow-lg"
      >
        +
      </button>

      {/* Sección inferior fija */}
      <div className="fixed bottom-0 left-0 right-0 space-y-2 border-t border-gray-200 bg-white p-4">
        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
          <span className="text-xl">📷</span>
          <span className="text-sm font-medium text-gray-700">
            {ticketPreview ? 'Ticket añadido ✓' : 'Subir ticket (opcional)'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleTicket} />
        </label>

        {ticketPreview && (
          <img src={ticketPreview} alt="Vista previa del ticket" className="h-24 w-full rounded-xl object-cover" />
        )}

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full rounded-xl bg-green-600 py-3.5 font-semibold text-white"
        >
          Finalizar compra
        </button>
      </div>

      {/* Modal confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="mb-2 text-lg font-bold text-gray-900">¿Terminar la compra?</h3>
            <p className="mb-6 text-sm text-gray-500">
              Los <strong>{checked}</strong> productos marcados se eliminarán de la lista
              pendiente. Los <strong>{total - checked}</strong> sin marcar se quedarán para la próxima vez.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinish}
                disabled={finishing}
                className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-50"
              >
                {finishing ? 'Finalizando…' : 'Terminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <AddItemModal
          title="Añadir durante la compra"
          onAdd={async (name, comment) => {
            await addItemToTrip(name, comment)
            setShowAdd(false)
          }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
