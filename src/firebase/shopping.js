import { v4 as uuidv4 } from 'uuid'
import {
  collection, doc, addDoc, deleteDoc, updateDoc, setDoc,
  getDocs, query, where, orderBy, limit, startAfter,
  serverTimestamp, onSnapshot, writeBatch,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './config'

const itemsCol = (fid) => collection(db, 'families', fid, 'shoppingItems')
const tripsCol = (fid) => collection(db, 'families', fid, 'shoppingTrips')
const tripItemsCol = (fid, tid) =>
  collection(db, 'families', fid, 'shoppingTrips', tid, 'items')

// ── Lista de pendientes ───────────────────────────────────────

export const addShoppingItem = async (familyId, name, comment, user) => {
  await addDoc(itemsCol(familyId), {
    name: name.trim(),
    comment: comment?.trim() || null,
    addedBy: user.uid,
    addedByName: user.name,
    createdAt: serverTimestamp(),
  })
}

export const deleteShoppingItem = async (familyId, itemId) => {
  await deleteDoc(doc(itemsCol(familyId), itemId))
}

export const subscribeToShoppingItems = (familyId, callback) => {
  const q = query(itemsCol(familyId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

// ── Sesión de compra ──────────────────────────────────────────

export const startShoppingTrip = async (familyId, store, user) => {
  // Pre-generar el tripId para poder hacer todo en un batch atómico
  const tripId = uuidv4()
  const tripRef = doc(db, 'families', familyId, 'shoppingTrips', tripId)

  const itemsSnap = await getDocs(itemsCol(familyId))
  const batch = writeBatch(db)

  batch.set(tripRef, {
    store,
    startedAt: serverTimestamp(),
    completedAt: null,
    startedBy: user.uid,
    startedByName: user.name,
    status: 'active',
    ticketPhotoUrl: null,
  })

  itemsSnap.docs.forEach((itemDoc) => {
    const tripItemRef = doc(tripItemsCol(familyId, tripId))
    batch.set(tripItemRef, {
      name: itemDoc.data().name,
      comment: itemDoc.data().comment,
      checked: false,
      checkedAt: null,
      addedDuringTrip: false,
      originalItemId: itemDoc.id,
    })
  })

  await batch.commit()
  return tripId
}

export const addItemDuringTrip = async (familyId, tripId, name, comment) => {
  await addDoc(tripItemsCol(familyId, tripId), {
    name: name.trim(),
    comment: comment?.trim() || null,
    checked: false,
    checkedAt: null,
    addedDuringTrip: true,
    originalItemId: null,
  })
}

export const toggleTripItem = async (familyId, tripId, itemId, checked) => {
  await updateDoc(doc(tripItemsCol(familyId, tripId), itemId), {
    checked,
    checkedAt: checked ? serverTimestamp() : null,
  })
}

export const completeShoppingTrip = async (familyId, tripId, ticketPhotoUrl) => {
  const tripItemsSnap = await getDocs(tripItemsCol(familyId, tripId))
  const batch = writeBatch(db)

  batch.update(doc(tripsCol(familyId), tripId), {
    status: 'completed',
    completedAt: serverTimestamp(),
    ticketPhotoUrl: ticketPhotoUrl || null,
  })

  // Solo borra de pendientes los items que están marcados Y venían de la lista
  tripItemsSnap.docs.forEach((tripItem) => {
    const { checked, originalItemId } = tripItem.data()
    if (checked && originalItemId) {
      batch.delete(doc(itemsCol(familyId), originalItemId))
    }
  })

  await batch.commit()
}

export const uploadTicketPhoto = async (familyId, tripId, file) => {
  const storageRef = ref(storage, `families/${familyId}/tickets/${tripId}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

export const subscribeToActiveTrip = (familyId, callback) => {
  const q = query(tripsCol(familyId), where('status', '==', 'active'))
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null)
    } else {
      const d = snap.docs[0]
      callback({ id: d.id, ...d.data() })
    }
  })
}

export const subscribeToTripItems = (familyId, tripId, callback) => {
  return onSnapshot(query(tripItemsCol(familyId, tripId)), (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export const getShoppingHistory = async (familyId, limitCount = 20, lastVisible = null) => {
  let q = query(
    tripsCol(familyId),
    where('status', '==', 'completed'),
    orderBy('completedAt', 'desc'),
    limit(limitCount)
  )
  if (lastVisible) q = query(q, startAfter(lastVisible))
  const snap = await getDocs(q)
  return {
    trips: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  }
}

export const getTripItems = async (familyId, tripId) => {
  const snap = await getDocs(tripItemsCol(familyId, tripId))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
