import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  addShoppingItem, deleteShoppingItem, subscribeToShoppingItems,
  startShoppingTrip, addItemDuringTrip, toggleTripItem,
  completeShoppingTrip, uploadTicketPhoto, subscribeToActiveTrip,
} from '../firebase/shopping'

export function useShopping() {
  const { user, userProfile, familyId } = useAuth()
  const [items, setItems] = useState([])
  const [activeTrip, setActiveTrip] = useState(undefined) // undefined = cargando
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!familyId) return

    const unsubItems = subscribeToShoppingItems(familyId, (data) => {
      setItems(data)
      setLoading(false)
    })

    const unsubTrip = subscribeToActiveTrip(familyId, setActiveTrip)

    return () => {
      unsubItems()
      unsubTrip()
    }
  }, [familyId])

  const userObj = useCallback(
    () => ({ uid: user?.uid, name: userProfile?.name }),
    [user?.uid, userProfile?.name]
  )

  const addItem = useCallback(
    (name, comment) => addShoppingItem(familyId, name, comment, userObj()),
    [familyId, userObj]
  )

  const deleteItem = useCallback(
    (itemId) => deleteShoppingItem(familyId, itemId),
    [familyId]
  )

  const startTrip = useCallback(
    (store) => startShoppingTrip(familyId, store, userObj()),
    [familyId, userObj]
  )

  const addItemToTrip = useCallback(
    (name, comment) => {
      if (!activeTrip?.id) return
      return addItemDuringTrip(familyId, activeTrip.id, name, comment)
    },
    [familyId, activeTrip?.id]
  )

  const toggleItem = useCallback(
    (itemId, checked) => {
      if (!activeTrip?.id) return
      return toggleTripItem(familyId, activeTrip.id, itemId, checked)
    },
    [familyId, activeTrip?.id]
  )

  const finishTrip = useCallback(
    async (photoFile) => {
      if (!activeTrip?.id) return
      let photoUrl = null
      if (photoFile) {
        photoUrl = await uploadTicketPhoto(familyId, activeTrip.id, photoFile)
      }
      await completeShoppingTrip(familyId, activeTrip.id, photoUrl)
    },
    [familyId, activeTrip?.id]
  )

  return { items, activeTrip, loading, addItem, deleteItem, startTrip, addItemToTrip, toggleItem, finishTrip }
}
