## Objetivo
Dejar el panel admin listo para producción usando Firebase real (Auth + Firestore + Storage) y despliegue en Vercel, manteniendo el login desde la landing con usuario/contraseña.

## 1) Crear proyecto Firebase
1. Firebase Console → Add project.
2. Activar **Authentication**, **Firestore Database**, **Storage**.
3. En Authentication → Sign-in method → habilitar **Email/Password**.

## 2) Crear usuario admin (Auth)
1. Authentication → Users → Add user.
2. Crear el usuario con:
   - Email (ejemplo): `admin@tudominio.com`
   - Contraseña (la que elijas)

## 3) Crear el “usuario” (alias) para login
La app permite entrar con:
- Email + contraseña (directo), o
- Usuario + contraseña (resuelve el email desde Firestore).

Para habilitar login por “usuario” (por ejemplo `admin`):
1. Firestore → crear colección `adminUsernames`
2. Crear documento con ID igual al usuario:
   - Document ID: `admin`
   - Campo `email`: `admin@tudominio.com`

Nota: la regla de seguridad evita listar esta colección (no se puede enumerar), pero sí permite `get` por ID para poder iniciar sesión.

## 4) Configurar reglas de seguridad (producción)
En el repo quedaron:
- [firestore.rules](file:///c:/Users/usuario/OneDrive/Desktop/Bicicleteria%20Laprida/firestore.rules)
- [storage.rules](file:///c:/Users/usuario/OneDrive/Desktop/Bicicleteria%20Laprida/storage.rules)
- [firebase.json](file:///c:/Users/usuario/OneDrive/Desktop/Bicicleteria%20Laprida/firebase.json)

### Paso obligatorio
Reemplazar en ambos archivos:
`REEMPLAZAR_POR_EMAIL_ADMIN`
por el email real del admin (ej: `admin@tudominio.com`).

### Publicación de reglas
Opción A (recomendada): Firebase CLI
1. Instalar Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. En la carpeta del proyecto:
   - `firebase init` (seleccionar Firestore y Storage, apuntando a este proyecto)
   - `firebase deploy --only firestore:rules,storage`

Opción B: pegar reglas en Firebase Console
- Firestore → Rules: pegar `firestore.rules`
- Storage → Rules: pegar `storage.rules`

## 5) Cargar contenido inicial (seed)
La app ya tiene contenido semilla local. En producción tenés dos opciones:
1. Entrar al panel admin y tocar “Restaurar semilla”, luego “Guardar cambios” (esto pobla Firestore).
2. Cargar manualmente documentos en Firestore (no recomendado).

## 6) Variables de entorno (Vercel)
En Vercel → Project → Settings → Environment Variables:
usar las claves del `.env.example`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Esas claves se obtienen desde Firebase Console → Project settings → “Your apps” → Web app.

## 7) Verificación final
1. Deploy en Vercel.
2. Abrir la landing publicada.
3. Entrar por `Admin` (header/footer).
4. Login con:
   - Usuario (ej `admin`) + contraseña
   - o Email + contraseña
5. Editar contenido y guardar:
   - Debe reflejarse en la landing y persistir tras recargar.

## Notas de producción
- No subir `.env` con credenciales: sólo variables en Vercel.
- Si vas a tener más de un admin, agregá más emails a la whitelist en `firestore.rules` y `storage.rules`.
