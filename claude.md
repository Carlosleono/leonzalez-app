# CLAUDE.md — Familia App

## Qué es este proyecto
PWA para uso privado de dos usuarios (pareja).
Sin backend propio. Sin usuarios externos. Sin registro público.
El objetivo es tener algo funcional rápido, no producción enterprise.

## Stack — versiones exactas
- React 18 + Vite 5
- Tailwind CSS v4 (plugin de Vite, NO el modo antiguo con tailwind.config.js)
- Firebase 10 (Auth + Firestore + Hosting)
- vite-plugin-pwa
- React Router v6

## Estructura de carpetas
src/
  components/    → Componentes reutilizables (botones, inputs, modales)
  pages/         → Una carpeta por página/sección (Login, Shopping, Finances, Baby)
  firebase/      → config.js y funciones por módulo (auth.js, shopping.js...)
  hooks/         → Custom hooks (useAuth, useShopping...)
  context/       → React Context (AuthContext, FamilyContext)

## Variables de entorno
Todas en .env.local (nunca en git). Formato VITE_FIREBASE_*
Ver .env.example para la lista completa.
Acceso en código: import.meta.env.VITE_FIREBASE_API_KEY

## Estructura de datos en Firestore
families/{familyId}/
  → members: [uid1, uid2]
  → createdAt: timestamp

families/{familyId}/shopping/{itemId}
  → name: string
  → checked: boolean
  → addedBy: uid
  → createdAt: timestamp

## Decisiones de arquitectura tomadas — no cambiar sin preguntar
- El familyId se genera al crear el hogar y el segundo usuario se une con un código.
  No cambiar este flujo aunque parezca más simple hacerlo de otra forma.
- Usamos onSnapshot de Firestore para tiempo real en la lista de la compra.
  No sustituir por getDocs o llamadas puntuales.
- Tailwind v4: la configuración va en vite.config.js y en el CSS con @import.
  No crear tailwind.config.js.

## Convenciones de código
- Siempre async/await, nunca .then().then()
- Componentes en PascalCase, funciones y hooks en camelCase
- Un componente por fichero
- Si un componente supera ~150 líneas, dividirlo
- Los errores de Firebase siempre se capturan y muestran al usuario en español

## Entorno de desarrollo

Entorno conda local en `./env` con Node.js 22 fijado.

```bash
# Primera vez (o tras clonar el repo):
conda env create --prefix ./env -f environment.yml
conda activate ./env
npm install

# Uso diario:
conda activate ./env   # desde la raíz del proyecto
npm run dev
```

Node.js mínimo requerido: **22.x** (Vite 8 no soporta versiones anteriores).
El entorno `./env/` está en .gitignore y no se sube al repositorio.

## Estado actual del proyecto

Sprint 0: ✅ Completado
  - Proyecto creado con Vite 8 + React 19
  - Tailwind CSS v4 configurado con @tailwindcss/vite (sin tailwind.config.js)
    → vite.config.js importa el plugin, index.css abre con @import "tailwindcss"
  - Firebase 12 inicializado en src/firebase/config.js
    → Exporta `auth` (getAuth) y `db` (getFirestore)
    → Lee credenciales desde import.meta.env.VITE_FIREBASE_*
  - Variables de entorno: .env.local en raíz (no subir), .env.example documentado
  - Estructura de carpetas: components/, pages/, firebase/, hooks/, context/
  - PWA manifest básico: nombre "Familia", theme_color #4f46e5
  - Entorno conda en ./env con Node.js 22
  - npm run dev arranca en http://localhost:5173 sin errores

Sprint 1: ✅ Completado — Autenticación y hogar familiar
  - AuthContext con onAuthStateChanged + onSnapshot del perfil (tiempo real)
    → Expone: user, userProfile, familyId, setFamilyId, loading
  - src/firebase/auth.js: registerUser, loginUser, logoutUser, createFamily, joinFamily
    → createFamily genera familyId único de 6 chars (sin chars ambiguos) con crypto.getRandomValues
    → joinFamily valida existencia y que el hogar tenga < 2 miembros
    → getFirebaseError traduce todos los códigos de error al español
  - ProtectedRoute: spinner → /login si no hay user → /setup si no hay familyId → children
  - Páginas: Login, Register, Setup, Home (placeholder)
    → Setup muestra el código en grande para copiar al crear hogar
    → setFamilyId optimista en el context tras crear/unirse (sin esperar onSnapshot)
  - React Router v6: /, /login, /register, /setup (con SetupGuard)
  - index.css limpiado — solo @import "tailwindcss"
  - Dependencia añadida: react-router-dom

Sprint 2: 🔄 Pendiente — Lista de la compra
Sprint 3: ⏳ Pendiente — Finanzas
Sprint 4: ⏳ Pendiente — Módulo bebé

## Deuda técnica conocida
(Aquí irás apuntando cosas que dejáis para después)

## Cómo desplegar
firebase deploy   ← despliega hosting
npm run build     ← genera la carpeta dist (lo llama firebase deploy automáticamente)
NO tocar firebase.json ni .firebaserc sin avisar.

## Lo que NO debes hacer sin que yo lo pida explícitamente
- Cambiar la estructura de Firestore
- Añadir nuevas dependencias sin mencionarlo
- Crear tests (no los necesitamos en esta fase)
- Añadir internacionalización (i18n)
- Modificar el sistema de autenticación una vez esté funcionando