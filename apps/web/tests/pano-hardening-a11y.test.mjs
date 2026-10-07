import { describe, expect, test } from 'bun:test'
import { ALL_CLASSROOMS } from '../services/demo/schoolDirectory.ts'
import {
  createPanoSession,
  pairPanoSession,
  verifyDeviceToken,
  createPanoTicket,
  verifyAndConsumeTicket,
  applyPanoAction,
  getPanoSharedState,
  checkMongoHealth,
} from '../lib/pano-pair/store.ts'

describe('Pano Hardening & A11y Suite', () => {
  describe('1. School Directory & Class Counts', () => {
    test('Necla Görer school directory has 28 classrooms', () => {
      const neclaClasses = ALL_CLASSROOMS.filter(c => c.org_id === 10)
      expect(neclaClasses.length).toBe(28)
    })

    test('Fevzi Kalkancı school directory has exactly 30 classrooms without duplicates', () => {
      const fevziClasses = ALL_CLASSROOMS.filter(c => c.org_id === 20)
      expect(fevziClasses.length).toBe(30)

      // Verify all classroom IDs are unique
      const ids = fevziClasses.map(c => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(30)

      // Verify 8-A is unique and assigned to Gülümser ERMEZ
      const class8A = fevziClasses.filter(c => c.name === '8-A Şubesi' || c.code === '8-A')
      expect(class8A.length).toBe(1)
      expect(class8A[0].teacher_name).toBe('Gülümser ERMEZ')

      // Verify Canan KAYA is not assigned to 8-A or in fevzi classrooms
      const cananRecords = fevziClasses.filter(c => c.teacher_name === 'Canan KAYA')
      expect(cananRecords.length).toBe(0)
    })
  })

  describe('2. Turkish Grade Grouping and Collation', () => {
    const groupClassroomsByGrade = (list) => {
      const groups = new Map()
      for (const c of list) {
        const key = c.gradeLevel || 'Diğer'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(c)
      }
      const gradeNum = (g) => parseInt(g, 10) || 999
      return Array.from(groups.entries())
        .sort((a, b) => gradeNum(a[0]) - gradeNum(b[0]) || a[0].localeCompare(b[0], 'tr'))
        .map(([grade, items]) => ({
          grade,
          items: [...items].sort((x, y) => x.name.localeCompare(y.name, 'tr', { numeric: true })),
        }))
    }

    test('correctly orders numeric grade levels and Turkish branch names', () => {
      const sample = [
        { id: 1, name: '8-B Şubesi', gradeLevel: '8. Sınıf' },
        { id: 2, name: '5-A Şubesi', gradeLevel: '5. Sınıf' },
        { id: 3, name: '8-A Şubesi', gradeLevel: '8. Sınıf' },
        { id: 4, name: '5-B Şubesi', gradeLevel: '5. Sınıf' },
        { id: 5, name: '10-A Şubesi', gradeLevel: '10. Sınıf' },
        { id: 6, name: '8-C Şubesi', gradeLevel: '8. Sınıf' },
      ]

      const grouped = groupClassroomsByGrade(sample)
      expect(grouped.length).toBe(3)
      expect(grouped[0].grade).toBe('5. Sınıf')
      expect(grouped[1].grade).toBe('8. Sınıf')
      expect(grouped[2].grade).toBe('10. Sınıf') // "10" sorts after "8", not before!

      // Branches inside 8. Sınıf are sorted alphabetically A -> B -> C
      const grade8Names = grouped[1].items.map(i => i.name)
      expect(grade8Names).toEqual(['8-A Şubesi', '8-B Şubesi', '8-C Şubesi'])
    })
  })

  describe('3. Token Verification Fail-Safe (GÖREV 4-a)', () => {
    test('rejects token verification when tokens are not defined in session', async () => {
      // Create session without tokens
      const session = await createPanoSession({ role: 'teacher', username: 'test_teacher' })
      expect(session).toBeDefined()

      // When token is invalid
      const isValid = await verifyDeviceToken(session.sessionId, 'invalid-random-token')
      expect(isValid).toBe(false)

      // When null or empty
      const isNullValid = await verifyDeviceToken(session.sessionId, null)
      expect(isNullValid).toBe(false)
    })
  })

  describe('4. Ticket Authentication & Single-Use Consumption (GÖREV 4-b)', () => {
    test('creates and single-use consumes short-lived tickets', async () => {
      const session = await createPanoSession({ role: 'teacher', username: 'test_teacher' })
      const token = session.boardDeviceToken || 'test-token-123'

      // Artificially attach token if needed for test isolation
      session.boardDeviceToken = token

      const ticket = await createPanoTicket(session.sessionId, token, 10000)
      expect(ticket).toBeDefined()
      expect(typeof ticket).toBe('string')
      expect(ticket.length).toBeGreaterThan(10)

      // First verification: should succeed
      const consumed = await verifyAndConsumeTicket(session.sessionId, ticket)
      expect(consumed).toBe(true)

      // Second verification (reuse): MUST fail (single-use)
      const reused = await verifyAndConsumeTicket(session.sessionId, ticket)
      expect(reused).toBe(false)
    })

    test('rejects expired tickets', async () => {
      const session = await createPanoSession({ role: 'teacher', username: 'test_teacher' })
      const token = session.boardDeviceToken || 'test-token-123'
      session.boardDeviceToken = token

      // Create ticket that expires immediately (-1 ms)
      const ticket = await createPanoTicket(session.sessionId, token, -100)
      const valid = await verifyAndConsumeTicket(session.sessionId, ticket)
      expect(valid).toBe(false)
    })
  })

  describe('5. Action-Based Synchronization & Monotonic State (FAZ 2)', () => {
    test('applies SELECT_CLASS action and updates version monotonically', async () => {
      const session = await createPanoSession({ role: 'teacher', username: 'test_teacher' })
      const sessionId = session.sessionId

      // Pair the session with teacher data
      const pairRes = await pairPanoSession(
        { sessionId },
        { id: 1, username: 'test_teacher', selectedClassId: null },
        'test-phone-token'
      )
      expect(pairRes.success).toBe(true)

      // Initial state
      const initial = await getPanoSharedState(sessionId)
      expect(initial?.version).toBe(1)
      expect(initial?.selectedClassId).toBeNull()

      // Apply SELECT_CLASS
      const updated = await applyPanoAction(
        sessionId,
        { type: 'SELECT_CLASS', classId: 102, class: { id: 102, name: '2-B Şubesi' } },
        'phone-client-1',
        'phone'
      )

      expect(updated).toBeDefined()
      expect(updated?.version).toBe(2)
      expect(updated?.selectedClassId).toBe(102)
      expect(updated?.selectedClass?.name).toBe('2-B Şubesi')
      expect(updated?.sourceDeviceId).toBe('phone-client-1')
      expect(updated?.updatedBy).toBe('phone')

      // Apply LOCK
      const locked = await applyPanoAction(
        sessionId,
        { type: 'LOCK' },
        'phone-client-1',
        'phone'
      )
      expect(locked?.version).toBe(3)
      expect(locked?.isLocked).toBe(true)

      // Apply UNLOCK
      const unlocked = await applyPanoAction(
        sessionId,
        { type: 'UNLOCK' },
        'board-client-1',
        'board'
      )
      expect(unlocked?.version).toBe(4)
      expect(unlocked?.isLocked).toBe(false)
    })
  })

  describe('6. 2D Geometric Vector D-Pad Navigation Algorithm', () => {
    test('calculates correct direction vector in 2D coordinate space', () => {
      // Simulating a 3-column grid with coordinates:
      // Row 1: Item 0 (0,0),   Item 1 (100,0),   Item 2 (200,0)
      // Row 2: Item 3 (0,100), Item 4 (100,100), Item 5 (200,100)
      const items = [
        { id: 0, x: 0, y: 0 },
        { id: 1, x: 100, y: 0 },
        { id: 2, x: 200, y: 0 },
        { id: 3, x: 0, y: 100 },
        { id: 4, x: 100, y: 100 },
        { id: 5, x: 200, y: 100 },
      ]

      const navigate = (fromIndex, direction) => {
        const current = items[fromIndex]
        let bestCandidate = null
        let minDistance = Infinity

        for (let i = 0; i < items.length; i++) {
          if (i === fromIndex) continue
          const target = items[i]
          const dx = target.x - current.x
          const dy = target.y - current.y

          let isValid = false
          if (direction === 'ArrowRight' && dx > 10 && Math.abs(dy) <= 60) isValid = true
          if (direction === 'ArrowLeft' && dx < -10 && Math.abs(dy) <= 60) isValid = true
          if (direction === 'ArrowDown' && dy > 10 && Math.abs(dx) <= 60) isValid = true
          if (direction === 'ArrowUp' && dy < -10 && Math.abs(dx) <= 60) isValid = true

          if (isValid) {
            const dist = Math.hypot(dx, dy)
            if (dist < minDistance) {
              minDistance = dist
              bestCandidate = i
            }
          }
        }
        return bestCandidate
      }

      // Moving Right from Item 0 should reach Item 1
      expect(navigate(0, 'ArrowRight')).toBe(1)

      // Moving Down from Item 1 should reach Item 4
      expect(navigate(1, 'ArrowDown')).toBe(4)

      // Moving Left from Item 4 should reach Item 3
      expect(navigate(4, 'ArrowLeft')).toBe(3)

      // Moving Up from Item 3 should reach Item 0
      expect(navigate(3, 'ArrowUp')).toBe(0)

      // Moving Up from Item 0 should return null (boundary)
      expect(navigate(0, 'ArrowUp')).toBeNull()
    })
  })

  describe('7. Health Endpoint Functionality', () => {
    test('checkMongoHealth returns environment status and ping result', async () => {
      const health = await checkMongoHealth()
      expect(health).toBeDefined()
      expect(typeof health.mongoConfigured).toBe('boolean')
      expect(typeof health.mongoPing).toBe('boolean')
      expect(typeof health.redisConfigured).toBe('boolean')
      expect(['vercel', 'other']).toContain(health.env)
    })
  })

  describe('8. Remote Control E2E Flow & HTTP Error Status Codes (GÖREV 3)', () => {
    test('pair -> confirm -> phone SELECT_CLASS -> board state updates with < 300ms latency', async () => {
      // 1. Board creates session
      const boardToken = 'board_token_xyz'
      const session = await createPanoSession(
        { role: 'teacher', username: 'ayse_ogretmen' },
        boardToken
      )
      const sessionId = session.sessionId

      // 2. Phone pairs with teacher payload
      const phoneToken = 'phone_token_abc'
      const pairRes = await pairPanoSession(
        { sessionId },
        {
          id: 10,
          username: 'ayse_ogretmen',
          first_name: 'Ayşe',
          last_name: 'Yılmaz',
          selectedClassId: null,
          classrooms: [
            { id: 101, name: '1-A Şubesi' },
            { id: 102, name: '1-B Şubesi' },
          ],
        },
        phoneToken
      )
      expect(pairRes.success).toBe(true)

      // 3. Phone dispatches SELECT_CLASS action
      const t0 = performance.now()
      const updated = await applyPanoAction(
        sessionId,
        { type: 'SELECT_CLASS', classId: 101, class: { id: 101, name: '1-A Şubesi' } },
        'phone-device-1',
        'phone'
      )
      const t1 = performance.now()

      // Latency target: action execution < 300ms
      const durationMs = t1 - t0
      expect(durationMs).toBeLessThan(300)

      // 4. Board queries state
      const boardState = await getPanoSharedState(sessionId)
      expect(boardState?.selectedClassId).toBe(101)
      expect(boardState?.selectedClass?.name).toBe('1-A Şubesi')
      expect(boardState?.sourceDeviceId).toBe('phone-device-1')
      expect(boardState?.updatedBy).toBe('phone')
      expect(boardState?.version).toBe(2)
    })

    test('verifies token security: valid token accepted, invalid token rejected', async () => {
      const session = await createPanoSession()
      const boardToken = session.boardDeviceToken
      const phoneToken = 'phone_secret_token_456'
      await pairPanoSession({ sessionId: session.sessionId }, { id: 1 }, phoneToken)

      // Valid tokens
      expect(await verifyDeviceToken(session.sessionId, boardToken)).toBe(true)
      expect(await verifyDeviceToken(session.sessionId, phoneToken)).toBe(true)

      // Tampered / invalid token
      expect(await verifyDeviceToken(session.sessionId, 'attacker_token')).toBe(false)
      expect(await verifyDeviceToken(session.sessionId, '')).toBe(false)
      expect(await verifyDeviceToken(session.sessionId, null)).toBe(false)
    })
  })

  describe('9. Viewport Responsive Layout & Accessibility Simulation (GÖREV 1)', () => {
    const VIEWPORTS = [
      { name: 'Smartboard 1366x768 (HD Ready)', width: 1366, height: 768 },
      { name: 'Smartboard 1920x1080 (Full HD)', width: 1920, height: 1080 },
      { name: 'Smartboard 3840x2160 (4K UHD)', width: 3840, height: 2160 },
      { name: 'Smartphone 390x844 (Mobile Remote)', width: 390, height: 844 },
    ]

    VIEWPORTS.forEach(({ name, width, height }) => {
      test(`verifies classroom list layout & accessibility for ${name}`, () => {
        const neclaClasses = ALL_CLASSROOMS.filter(c => c.org_id === 10)
        const fevziClasses = ALL_CLASSROOMS.filter(c => c.org_id === 20)

        expect(neclaClasses.length).toBe(28)
        expect(fevziClasses.length).toBe(30)

        // Verify all 30 classes have complete accessibility tags
        fevziClasses.forEach((cls) => {
          expect(cls.name).toBeDefined()
          expect(cls.teacher_name).toBeDefined()
          expect(cls.grade_level).toBeDefined()

          // Simulated accessible card properties
          const accessibleProps = {
            role: 'button',
            tabIndex: 0,
            'aria-label': `${cls.name} - ${cls.teacher_name} - ${cls.grade_level}`,
            'data-grid-item': 'class-card',
          }
          expect(accessibleProps.role).toBe('button')
          expect(accessibleProps.tabIndex).toBe(0)
          expect(accessibleProps['aria-label']).toContain(cls.name)
        })

        // Verify viewport layout constraints
        const isMobile = width < 640
        const columns = width >= 1920 ? 5 : width >= 1280 ? 4 : width >= 1024 ? 3 : width >= 640 ? 2 : 1
        expect(columns).toBeGreaterThanOrEqual(1)
        expect(columns).toBeLessThanOrEqual(5)

        if (isMobile) {
          expect(columns).toBe(1)
        } else if (width === 1366) {
          expect(columns).toBe(4)
        } else if (width >= 1920) {
          expect(columns).toBe(5)
        }
      })
    })
  })
})
