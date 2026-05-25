import { useState } from 'react'

const STORES = ['Mercadona', 'Carrefour', 'Lidl', 'El Corte Inglés', 'Otro']

export default function StartTripModal({ onStart, onClose }) {
  const [store, setStore] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!store.trim()) return
    setLoading(true)
    await onStart(store.trim())
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full rounded-t-3xl bg-white px-4 pb-10 pt-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          ¿Dónde vas a hacer la compra?
        </h2>
        <p className="mb-4 text-sm text-gray-500">Selecciona o escribe el nombre de la tienda</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {STORES.map((s) => (
            <button
              key={s}
              onClick={() => setStore(s)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                store === s
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          placeholder="O escribe el nombre…"
          className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />

        <button
          onClick={handleStart}
          disabled={loading || !store.trim()}
          className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Iniciando…' : 'Empezar compra'}
        </button>
      </div>
    </div>
  )
}
