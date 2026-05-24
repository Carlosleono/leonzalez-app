import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [familyId, setFamilyId] = useState(null)
  const [loading, setLoading] = useState(true)
  const unsubscribeProfileRef = useRef(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Cancela la suscripción al perfil anterior al cambiar de usuario
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current()
        unsubscribeProfileRef.current = null
      }

      if (!firebaseUser) {
        setUser(null)
        setUserProfile(null)
        setFamilyId(null)
        setLoading(false)
        return
      }

      setUser(firebaseUser)

      // onSnapshot mantiene el familyId actualizado en tiempo real
      // (se actualiza automáticamente tras createFamily/joinFamily)
      unsubscribeProfileRef.current = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        (snap) => {
          if (snap.exists()) {
            const profile = snap.data()
            setUserProfile(profile)
            setFamilyId(profile.familyId ?? null)
          }
          setLoading(false)
        }
      )
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeProfileRef.current) unsubscribeProfileRef.current()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, familyId, setFamilyId, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
