import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getShoppingHistory, getTripItems } from '../firebase/shopping'

const formatDate = (ts) => {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ShoppingHistory() {
  const { familyId } = useAuth()
  const [trips, setTrips] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [expandedItems, setExpandedItems] = useState({})

  useEffect(() => {
    if (familyId) load(false)
  }, [familyId])

  const load = async (append) => {
    setLoading(true)
    try {
      const { trips: newTrips, lastDoc: newLast } = await getShoppingHistory(
        familyId, 20, append ? lastDoc : null
      )
      setTrips((prev) => (append ? [...prev, ...newTrips] : newTrips))
      setLastDoc(newLast)
      setHasMore(newTrips.length === 20)
    } finally {
      setLoading(false)
    }
  }

  const handleExpand = async (tripId) => {
    if (expandedId === tripId) { setExpandedId(null); return }
    setExpandedId(tripId)
    if (!expandedItems[tripId]) {
      const its = await getTripItems(familyId, tripId)
      setExpandedItems((prev) => ({ ...prev, [tripId]: its }))
    }
  }

  if (loading && trips.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pb-4 pt-12 shadow-sm">
        <Link to="/shopping" className="mb-2 block text-sm text-gray-400">← Volver</Link>
        <h1 className="text-2xl font-bold text-gray-900">Historial de compras</h1>
      </div>

      <div className="space-y-3 px-4 pt-4">
        {trips.length === 0 && !loading && (
          <p className="py-16 text-center text-gray-400">Aún no hay compras completadas.</p>
        )}

        {trips.map((trip) => {
          const its = expandedItems[trip.id] || []
          const isOpen = expandedId === trip.id

          return (
            <div key={trip.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <button
                onClick={() => handleExpand(trip.id)}
                className="w-full px-4 py-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{trip.store}</p>
                    <p className="text-xs capitalize text-gray-400">{formatDate(trip.completedAt)}</p>
                    <p className="mt-0.5 text-xs text-gray-500">Por {trip.startedByName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {trip.ticketPhotoUrl && <span>📷</span>}
                    <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-4 pb-5 pt-3">
                  {its.length === 0 ? (
                    <p className="text-sm text-gray-400">Cargando…</p>
                  ) : (
                    <ul className="space-y-2">
                      {its.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-sm">
                          <span className={item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}>
                            {item.checked ? '✓' : '·'} {item.name}
                          </span>
                          {item.addedDuringTrip && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600">
                              Añadido aquí
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {trip.ticketPhotoUrl && (
                    <img
                      src={trip.ticketPhotoUrl}
                      alt="Ticket de compra"
                      className="mt-4 w-full rounded-xl object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}

        {hasMore && (
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-600 disabled:opacity-50"
          >
            {loading ? 'Cargando…' : 'Cargar más'}
          </button>
        )}
      </div>
    </div>
  )
}
