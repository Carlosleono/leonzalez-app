import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './config'

const FIREBASE_ERRORS = {
  'auth/user-not-found': 'No existe una cuenta con este email',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-credential': 'Email o contraseña incorrectos',
  'auth/email-already-in-use': 'Este email ya está registrado',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/invalid-email': 'El email no es válido',
  'family-not-found': 'No existe ningún hogar con ese código',
  'family-full': 'Este hogar ya tiene 2 miembros',
}

export const getFirebaseError = (error) =>
  FIREBASE_ERRORS[error.code] ?? 'Ha ocurrido un error. Inténtalo de nuevo'

export const registerUser = async (email, password, name) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', user.uid), {
    name,
    email,
    familyId: null,
    createdAt: serverTimestamp(),
  })
  return user
}

export const loginUser = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export const logoutUser = async () => {
  await signOut(auth)
}

const generateFamilyId = () => {
  // Excluye caracteres ambiguos (0/O, 1/I/L)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

export const createFamily = async (uid) => {
  let familyId
  let exists = true
  while (exists) {
    familyId = generateFamilyId()
    const snap = await getDoc(doc(db, 'families', familyId))
    exists = snap.exists()
  }
  await setDoc(doc(db, 'families', familyId), {
    members: [uid],
    joinCode: familyId,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'users', uid), { familyId })
  return familyId
}

export const joinFamily = async (uid, joinCode) => {
  const code = joinCode.trim().toUpperCase()
  const familyRef = doc(db, 'families', code)
  const snap = await getDoc(familyRef)
  if (!snap.exists()) {
    const err = new Error()
    err.code = 'family-not-found'
    throw err
  }
  const { members } = snap.data()
  if (members.length >= 2) {
    const err = new Error()
    err.code = 'family-full'
    throw err
  }
  await updateDoc(familyRef, { members: arrayUnion(uid) })
  await updateDoc(doc(db, 'users', uid), { familyId: code })
  return code
}
