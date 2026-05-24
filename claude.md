# Leonzalez App

## Qué es esto
PWA familiar para dos usuarios (yo Carlos y mi mujer Alejandra).
Sin backend propio — usamos Firebase.

## Stack
- React + Vite
- Tailwind CSS
- Firebase (Auth + Firestore + Hosting)
- vite-plugin-pwa

## Estructura Firebase
families/{familyId}/
  members: [uid1, uid2]
  shopping/{itemId}: { name, checked, addedBy, createdAt }
  finances/...
  baby/...

## Reglas de código
- Componentes en /src/components
- Páginas en /src/pages
- Lógica Firebase en /src/firebase
- Siempre usar async/await, nunca .then()
- Tailwind para estilos, nada de CSS inline

## Estado actual
Sprint 1 completado: Auth + estructura base
Sprint 2 en curso: Lista de la compra