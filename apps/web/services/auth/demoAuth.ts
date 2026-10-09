import { DEFAULT_FALLBACK_ORG } from '@services/organizations/orgs'

export interface DemoUser {
  id: number
  user_uuid: string
  username: string
  email: string
  password?: string
  first_name: string
  last_name: string
  email_verified: boolean
  is_superadmin: boolean
  is_demo: boolean
  avatar_image: string
  plan?: string
  role: {
    id: number
    role_uuid: string
    name: string
    rights: Record<string, any>
  }
}

// Strictly authentic accounts — Zero demo / dummy accounts
export const DEMO_USERS: Record<string, DemoUser> = {
  // 👔 OKUL MÜDÜRÜ: Dr. Uğur UĞURLU
  'mudur@oxonom.com': {
    id: 50,
    user_uuid: 'user_64e03f9b-6734-414a-9775-f87f52dae15d',
    username: 'mudur',
    email: 'mudur@oxonom.com',
    password: 'Ugur2803*',
    first_name: 'Dr. Uğur',
    last_name: 'UĞURLU',
    email_verified: true,
    is_superadmin: true,
    is_demo: false,
    avatar_image: '',
    role: {
      id: 1,
      role_uuid: 'role_admin',
      name: 'Admin',
      rights: {
        courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: true, action_delete_own: true },
        users: { action_create: true, action_read: true, action_update: true, action_delete: true },
        usergroups: { action_create: true, action_read: true, action_update: true, action_delete: true },
        folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
        media: { action_create: true, action_read: true, action_update: true, action_delete: true },
        organizations: { action_create: true, action_read: true, action_update: true, action_delete: true },
        coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
        activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
        roles: { action_create: true, action_read: true, action_update: true, action_delete: true },
        dashboard: { action_access: true },
      },
    },
  },
  'mudur': {
    id: 50,
    user_uuid: 'user_64e03f9b-6734-414a-9775-f87f52dae15d',
    username: 'mudur',
    email: 'mudur@oxonom.com',
    password: 'Ugur2803*',
    first_name: 'Dr. Uğur',
    last_name: 'UĞURLU',
    email_verified: true,
    is_superadmin: true,
    is_demo: false,
    avatar_image: '',
    role: {
      id: 1,
      role_uuid: 'role_admin',
      name: 'Admin',
      rights: {
        courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: true, action_delete_own: true },
        users: { action_create: true, action_read: true, action_update: true, action_delete: true },
        usergroups: { action_create: true, action_read: true, action_update: true, action_delete: true },
        folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
        media: { action_create: true, action_read: true, action_update: true, action_delete: true },
        organizations: { action_create: true, action_read: true, action_update: true, action_delete: true },
        coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
        activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
        roles: { action_create: true, action_read: true, action_update: true, action_delete: true },
        dashboard: { action_access: true },
      },
    },
  },
  'idare@oxonom.com': {
    id: 50,
    user_uuid: 'user_64e03f9b-6734-414a-9775-f87f52dae15d',
    username: 'mudur',
    email: 'mudur@oxonom.com',
    password: 'Ugur2803*',
    first_name: 'Dr. Uğur',
    last_name: 'UĞURLU',
    email_verified: true,
    is_superadmin: true,
    is_demo: false,
    avatar_image: '',
    role: {
      id: 1,
      role_uuid: 'role_admin',
      name: 'Admin',
      rights: {
        courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: true, action_delete_own: true },
        users: { action_create: true, action_read: true, action_update: true, action_delete: true },
        usergroups: { action_create: true, action_read: true, action_update: true, action_delete: true },
        folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
        media: { action_create: true, action_read: true, action_update: true, action_delete: true },
        organizations: { action_create: true, action_read: true, action_update: true, action_delete: true },
        coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
        activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
        roles: { action_create: true, action_read: true, action_update: true, action_delete: true },
        dashboard: { action_access: true },
      },
    },
  },

  // 👩‍🏫 EDEBİYAT ÖĞRETMENİ & 9-A REHBERİ: Ebru TEKNECİ
  'ogretmen@oxonom.com': {
    id: 3001,
    user_uuid: 'user_6f129354-53fb-40c0-be52-0cc8dc07cce1',
    username: 'ogretmen',
    email: 'ogretmen@oxonom.com',
    password: 'Ugur2803*',
    first_name: 'Ebru',
    last_name: 'TEKNECİ',
    email_verified: true,
    is_superadmin: false,
    is_demo: false,
    avatar_image: '',
    role: {
      id: 3,
      role_uuid: 'role_teacher',
      name: 'Teacher',
      rights: {
        courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: false, action_delete_own: true },
        users: { action_create: false, action_read: true, action_update: false, action_delete: false },
        usergroups: { action_create: true, action_read: true, action_update: true, action_delete: false },
        folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
        media: { action_create: true, action_read: true, action_update: true, action_delete: true },
        organizations: { action_create: false, action_read: true, action_update: false, action_delete: false },
        coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
        activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
        roles: { action_create: false, action_read: true, action_update: false, action_delete: false },
        dashboard: { action_access: true },
      },
    },
  },
  'ogretmen': {
    id: 3001,
    user_uuid: 'user_6f129354-53fb-40c0-be52-0cc8dc07cce1',
    username: 'ogretmen',
    email: 'ogretmen@oxonom.com',
    password: 'Ugur2803*',
    first_name: 'Ebru',
    last_name: 'TEKNECİ',
    email_verified: true,
    is_superadmin: false,
    is_demo: false,
    avatar_image: '',
    role: {
      id: 3,
      role_uuid: 'role_teacher',
      name: 'Teacher',
      rights: {
        courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: false, action_delete_own: true },
        users: { action_create: false, action_read: true, action_update: false, action_delete: false },
        usergroups: { action_create: true, action_read: true, action_update: true, action_delete: false },
        folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
        media: { action_create: true, action_read: true, action_update: true, action_delete: true },
        organizations: { action_create: false, action_read: true, action_update: false, action_delete: false },
        coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
        activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
        roles: { action_create: false, action_read: true, action_update: false, action_delete: false },
        dashboard: { action_access: true },
      },
    },
  },

  // 🎒 ÖĞRENCİ (9-A ŞUBESİ NO: 101): Erçil UĞURLU
  'ogrenci@oxonom.com': {
    id: 3001,
    user_uuid: 'user_ercil_ugurlu',
    username: 'ogrenci',
    email: 'ogrenci@oxonom.com',
    password: 'Ugur2803*',
    first_name: 'Erçil',
    last_name: 'UĞURLU',
    email_verified: true,
    is_superadmin: false,
    is_demo: false,
    avatar_image: '',
    role: {
      id: 4,
      role_uuid: 'role_student',
      name: 'Student',
      rights: {
        courses: { action_create: false, action_read: true, action_read_own: false, action_update: false, action_update_own: false, action_delete: false, action_delete_own: false },
        users: { action_create: false, action_read: false, action_update: false, action_delete: false },
        usergroups: { action_create: false, action_read: true, action_update: false, action_delete: false },
        folders: { action_create: false, action_read: true, action_update: false, action_delete: false },
        media: { action_create: false, action_read: true, action_update: false, action_delete: false },
        organizations: { action_create: false, action_read: true, action_update: false, action_delete: false },
        coursechapters: { action_create: false, action_read: true, action_update: false, action_delete: false },
        activities: { action_create: false, action_read: true, action_update: false, action_delete: false },
        roles: { action_create: false, action_read: false, action_update: false, action_delete: false },
        dashboard: { action_access: true },
      },
    },
  },
  'ogrenci': {
    id: 3001,
    user_uuid: 'user_ercil_ugurlu',
    username: 'ogrenci',
    email: 'ogrenci@oxonom.com',
    password: 'Ugur2803*',
    first_name: 'Erçil',
    last_name: 'UĞURLU',
    email_verified: true,
    is_superadmin: false,
    is_demo: false,
    avatar_image: '',
    role: {
      id: 4,
      role_uuid: 'role_student',
      name: 'Student',
      rights: {
        courses: { action_create: false, action_read: true, action_read_own: false, action_update: false, action_update_own: false, action_delete: false, action_delete_own: false },
        users: { action_create: false, action_read: false, action_update: false, action_delete: false },
        usergroups: { action_create: false, action_read: true, action_update: false, action_delete: false },
        folders: { action_create: false, action_read: true, action_update: false, action_delete: false },
        media: { action_create: false, action_read: true, action_update: false, action_delete: false },
        organizations: { action_create: false, action_read: true, action_update: false, action_delete: false },
        coursechapters: { action_create: false, action_read: true, action_update: false, action_delete: false },
        activities: { action_create: false, action_read: true, action_update: false, action_delete: false },
        roles: { action_create: false, action_read: false, action_update: false, action_delete: false },
        dashboard: { action_access: true },
      },
    },
  },
}

export function createDemoJwt(user: DemoUser): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      sub: String(user.id),
      user_uuid: user.user_uuid,
      email: user.email,
      username: user.username,
      is_superadmin: user.is_superadmin,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      iat: Math.floor(Date.now() / 1000),
      type: 'access',
    })
  ).toString('base64url')
  return `${header}.${payload}.demotoken`
}

export function findDemoUser(identifier: string): DemoUser | null {
  if (!identifier) return null
  const normalized = identifier.toLowerCase().trim()
  if (DEMO_USERS[normalized]) return DEMO_USERS[normalized]

  const cleanDigits = identifier.replace(/\D/g, '')

  // Check username match or sub match or phone digits match
  for (const user of Object.values(DEMO_USERS)) {
    if (
      user.username.toLowerCase() === normalized ||
      user.user_uuid === identifier ||
      String(user.id) === identifier ||
      (cleanDigits && cleanDigits.length >= 7 && (user.username === cleanDigits || user.email.includes(cleanDigits)))
    ) {
      return user
    }
  }

  // Student number or phone number matches
  if (
    normalized === '101' ||
    normalized === '2026-001' ||
    (cleanDigits && (cleanDigits.includes('5329992200') || cleanDigits.includes('5329991100')))
  ) {
    return DEMO_USERS['ogrenci@oxonom.com']
  }

  // Check token
  if (identifier.includes('.')) {
    try {
      const parts = identifier.split('.')
      if (parts.length >= 2) {
        const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const json = Buffer.from(padded, 'base64').toString('utf-8')
        const data = JSON.parse(json)
        if (data.email && DEMO_USERS[data.email.toLowerCase()]) {
          return DEMO_USERS[data.email.toLowerCase()]
        }
      }
    } catch {
      // not a jwt
    }
  }

  return null
}

export function getDemoSession(demoUser: DemoUser) {
  const userPlan = demoUser.plan || (demoUser.role.id === 3 ? 'premium' : demoUser.role.id === 1 ? 'enterprise' : 'student')

  // Flagship & Sole Organization: Oxonom Okulları
  const oxonomOrg = {
    ...DEFAULT_FALLBACK_ORG,
    id: 30,
    org_uuid: 'org_oxonom_okullari',
    name: 'Oxonom Okulları',
    slug: 'oxonom',
    description: '1 Okul, 1 Sınıf, 1 Müdür, 1 Öğretmen, 1 Öğrenci — Bütünleşik Dijital Kurum',
    about: 'Oxonom Okulları; okul müdürü, sınıf rehber öğretmeni ve öğrencinin tamamen birbirine tanımlandığı akıllı eğitim kurumu.',
    logo_image: '/pwa-icon.svg',
    is_demo: false,
    config: {
      ...DEFAULT_FALLBACK_ORG.config,
      config: {
        ...DEFAULT_FALLBACK_ORG.config.config,
        plan: 'premium',
      },
    },
  }

  return {
    user: {
      id: demoUser.id,
      user_uuid: demoUser.user_uuid,
      username: demoUser.username,
      first_name: demoUser.first_name,
      last_name: demoUser.last_name,
      email: demoUser.email,
      email_verified: demoUser.email_verified,
      is_superadmin: demoUser.is_superadmin,
      avatar_image: demoUser.avatar_image,
      is_demo: false,
      plan: userPlan,
      school_org_id: oxonomOrg.id,
      school_slug: oxonomOrg.slug,
      school_name: oxonomOrg.name,
    },
    roles: [
      {
        role: {
          id: demoUser.role.id,
          role_uuid: demoUser.role.role_uuid,
          name: demoUser.role.name,
          rights: demoUser.role.rights,
        },
        org: oxonomOrg,
      },
    ],
  }
}

import {
  SYNCED_BOARDS,
  SYNCED_USERGROUPS,
  SYNCED_ASSIGNMENTS,
  SYNCED_DISCUSSIONS,
  SYNCED_PLAYGROUNDS,
} from '../demo/databaseSync'

export const FALLBACK_PLAYGROUNDS = SYNCED_PLAYGROUNDS
export const FALLBACK_BOARDS = SYNCED_BOARDS
export const FALLBACK_USERGROUPS = SYNCED_USERGROUPS
export const FALLBACK_ASSIGNMENTS = SYNCED_ASSIGNMENTS
export const FALLBACK_DISCUSSIONS = SYNCED_DISCUSSIONS
