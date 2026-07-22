import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { siteSeed } from '@/data/siteSeed'
import { firebaseAuth, firebaseDb, firebaseEnabled, firebaseStorage } from '@/lib/firebase'
import type {
  AdminCredentials,
  Brand,
  Category,
  CustomerItem,
  NewsItem,
  Product,
  SiteContent,
  SiteSettings,
} from '@/types/site'

const LOCAL_CONTENT_KEY = 'laprida_site_content_v2'
const LOCAL_AUTH_KEY = 'laprida_admin_demo_session'
const LOCAL_ADMIN_CREDENTIALS_KEY = 'laprida_admin_demo_credentials'
const LOCAL_AUTH_EVENT = 'laprida-admin-session-changed'

const DEMO_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'laprida123',
  email: 'admin@laprida.local',
}

const sortByOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((left, right) => left.order - right.order)

const cloneSeed = (): SiteContent => JSON.parse(JSON.stringify(siteSeed))
const normalizeSettings = (settings?: Partial<SiteSettings>): SiteSettings => ({
  ...cloneSeed().settings,
  ...settings,
  heroSlides: sortByOrder(settings?.heroSlides || cloneSeed().settings.heroSlides).slice(0, 3),
})
const normalizeProduct = (product: Partial<Product>): Product => {
  const images = (product.images?.filter(Boolean) || []).length
    ? (product.images?.filter(Boolean) as string[])
    : product.imageUrl
      ? [product.imageUrl]
      : []

  return {
    ...product,
    imageUrl: images[0] || product.imageUrl || '/assets/casco-integral.jpg',
    images,
    description: product.description || '',
  } as Product
}

const parseDocs = <T>(snapshot: { docs: Array<{ id: string; data: () => unknown }> }) =>
  snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Record<string, unknown>) })) as T[]

const getLocalAdminCredentials = () => {
  const raw = localStorage.getItem(LOCAL_ADMIN_CREDENTIALS_KEY)
  if (!raw) {
    return DEMO_ADMIN_CREDENTIALS
  }

  try {
    return JSON.parse(raw) as typeof DEMO_ADMIN_CREDENTIALS
  } catch {
    return DEMO_ADMIN_CREDENTIALS
  }
}

export function loadLocalAdminCredentials() {
  return getLocalAdminCredentials()
}

export function saveLocalAdminCredentials(credentials: { username: string; password: string }) {
  const current = getLocalAdminCredentials()
  localStorage.setItem(
    LOCAL_ADMIN_CREDENTIALS_KEY,
    JSON.stringify({
      ...current,
      username: credentials.username,
      password: credentials.password,
    }),
  )
}

export async function loadSiteContent(): Promise<SiteContent> {
  if (!firebaseEnabled || !firebaseDb) {
    const raw = localStorage.getItem(LOCAL_CONTENT_KEY)
    if (!raw) {
      return cloneSeed()
    }

    const parsed = JSON.parse(raw) as SiteContent
    return {
      ...parsed,
      settings: normalizeSettings(parsed.settings),
      products: sortByOrder((parsed.products || []).map((product) => normalizeProduct(product))),
    }
  }

  const [settingsDoc, categoriesDocs, brandsDocs, productsDocs, newsDocs, customersDocs] =
    await Promise.all([
      getDocs(collection(firebaseDb, 'siteSettings')),
      getDocs(collection(firebaseDb, 'categories')),
      getDocs(collection(firebaseDb, 'brands')),
      getDocs(collection(firebaseDb, 'products')),
      getDocs(collection(firebaseDb, 'news')),
      getDocs(collection(firebaseDb, 'customers')),
    ])

  const settingsRecord = settingsDoc.docs[0]?.data() as SiteSettings | undefined

  return {
    settings: normalizeSettings(settingsRecord),
    categories: sortByOrder(parseDocs<Category>(categoriesDocs)),
    brands: sortByOrder(parseDocs<Brand>(brandsDocs)),
    products: sortByOrder(parseDocs<Product>(productsDocs).map((product) => normalizeProduct(product))),
    news: sortByOrder(parseDocs<NewsItem>(newsDocs)),
    customers: sortByOrder(parseDocs<CustomerItem>(customersDocs)),
  }
}

export async function saveSiteContent(content: SiteContent) {
  const normalizedContent = {
    ...content,
    settings: normalizeSettings(content.settings),
    products: sortByOrder(content.products.map((product) => normalizeProduct(product))),
  }

  if (!firebaseEnabled || !firebaseDb) {
    localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(normalizedContent))
    return
  }

  const batch = writeBatch(firebaseDb)
  batch.set(doc(firebaseDb, 'siteSettings', 'main'), normalizedContent.settings)

  const syncCollection = async <T extends { id: string }>(name: string, items: T[]) => {
    const existing = await getDocs(collection(firebaseDb, name))
    const keepIds = new Set(items.map((item) => item.id))

    existing.docs.forEach((item) => {
      if (!keepIds.has(item.id)) {
        batch.delete(doc(firebaseDb, name, item.id))
      }
    })

    items.forEach((item) => {
      batch.set(doc(firebaseDb, name, item.id), item)
    })
  }

  await Promise.all([
    syncCollection('categories', normalizedContent.categories),
    syncCollection('brands', normalizedContent.brands),
    syncCollection('products', normalizedContent.products),
    syncCollection('news', normalizedContent.news),
    syncCollection('customers', normalizedContent.customers),
  ])

  await batch.commit()
}

export async function seedFirebaseContent() {
  if (!firebaseEnabled || !firebaseDb) {
    localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(cloneSeed()))
    return
  }

  await saveSiteContent(cloneSeed())
}

export async function uploadSiteImage(file: File, folder: string) {
  if (!firebaseEnabled || !firebaseStorage) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
      reader.readAsDataURL(file)
    })
  }

  const fileRef = ref(firebaseStorage, `${folder}/${Date.now()}-${file.name}`)
  await uploadBytes(fileRef, file)
  return await getDownloadURL(fileRef)
}

export async function signInAdmin(credentials: AdminCredentials) {
  if (!firebaseEnabled || !firebaseAuth) {
    const localCredentials = getLocalAdminCredentials()
    const isValid =
      credentials.username === localCredentials.username &&
      credentials.password === localCredentials.password

    if (!isValid) {
      throw new Error('Usuario o contraseña incorrectos')
    }

    localStorage.setItem(
      LOCAL_AUTH_KEY,
      JSON.stringify({
        email: localCredentials.email,
        username: localCredentials.username,
        loggedInAt: Date.now(),
      }),
    )
    window.dispatchEvent(new Event(LOCAL_AUTH_EVENT))
    return
  }

  let signInEmail = credentials.username

  if (!credentials.username.includes('@') && firebaseDb) {
    const mapping = await getDoc(doc(firebaseDb, 'adminUsernames', credentials.username))
    const data = mapping.exists() ? (mapping.data() as { email?: string } | undefined) : undefined

    if (!data?.email) {
      throw new Error('Usuario administrador no encontrado')
    }

    signInEmail = data.email
  }

  await setPersistence(firebaseAuth, browserLocalPersistence)
  await signInWithEmailAndPassword(firebaseAuth, signInEmail, credentials.password)
}

export async function signOutAdmin() {
  if (!firebaseEnabled || !firebaseAuth) {
    localStorage.removeItem(LOCAL_AUTH_KEY)
    window.dispatchEvent(new Event(LOCAL_AUTH_EVENT))
    return
  }

  await signOut(firebaseAuth)
}

export function subscribeAdminSession(
  callback: (session: { email: string | null; isAuthenticated: boolean }) => void,
) {
  if (!firebaseEnabled || !firebaseAuth) {
    const readLocalSession = () => {
      const raw = localStorage.getItem(LOCAL_AUTH_KEY)
      const parsed = raw ? (JSON.parse(raw) as { email?: string; username?: string }) : null
      callback({
        email: parsed?.username || parsed?.email || null,
        isAuthenticated: Boolean(parsed?.email),
      })
    }

    readLocalSession()
    const listener = () => readLocalSession()
    window.addEventListener('storage', listener)
    window.addEventListener(LOCAL_AUTH_EVENT, listener)
    return () => {
      window.removeEventListener('storage', listener)
      window.removeEventListener(LOCAL_AUTH_EVENT, listener)
    }
  }

  return onAuthStateChanged(firebaseAuth, (user: User | null) => {
    callback({
      email: user?.email || null,
      isAuthenticated: Boolean(user),
    })
  })
}

export async function ensureLocalSeed() {
  if (firebaseEnabled) {
    return
  }

  if (!localStorage.getItem(LOCAL_CONTENT_KEY)) {
    localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(cloneSeed()))
  }

  if (!localStorage.getItem(LOCAL_ADMIN_CREDENTIALS_KEY)) {
    localStorage.setItem(LOCAL_ADMIN_CREDENTIALS_KEY, JSON.stringify(DEMO_ADMIN_CREDENTIALS))
  }
}

export async function updateSiteSettings(settings: SiteSettings) {
  const current = await loadSiteContent()
  await saveSiteContent({ ...current, settings })
}

export async function replaceSiteCollection(
  key: keyof Pick<SiteContent, 'categories' | 'brands' | 'products' | 'news' | 'customers'>,
  value: Category[] | Brand[] | Product[] | NewsItem[] | CustomerItem[],
) {
  const current = await loadSiteContent()
  await saveSiteContent({ ...current, [key]: value } as SiteContent)
}

export async function upsertSettingsDoc(settings: SiteSettings) {
  if (!firebaseEnabled || !firebaseDb) {
    await updateSiteSettings(settings)
    return
  }

  await setDoc(doc(firebaseDb, 'siteSettings', 'main'), settings)
}
