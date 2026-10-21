import { getSupabaseBrowserClient, isSupabaseConfigured } from './client'

export interface SchoolClass {
  id: string
  name: string
  grade: number
  branch: string
  student_count: number
  classroom: string
}

export interface SchoolTeacher {
  id: string
  full_name: string
  branch: string
  email?: string
  phone?: string
  assigned_classes: string[]
}

export interface SchoolStudent {
  id: string
  full_name: string
  student_number: string
  class_name: string
  parent_name?: string
  parent_phone?: string
  attendance_status: 'present' | 'absent' | 'late' | 'excused'
}

export interface SchoolAnnouncement {
  id: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  target_audience: string[]
  target_classes?: string[]
  sender_name: string
  sender_role: string
  is_sms_sent?: boolean
  created_at: string
}

/**
 * Service to fetch school data from Supabase with graceful fallback to cached/local storage.
 */
export const SchoolService = {
  /**
   * Fetch all 32 branches of Necla Görer İlkokulu
   */
  async getClasses(): Promise<SchoolClass[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client
          .from('classes')
          .select('*')
          .order('grade', { ascending: true })
          .order('branch', { ascending: true })

        if (!error && Array.isArray(data) && data.length > 0) {
          return data
        }
      } catch (err) {
        console.warn('[SchoolService] Supabase query failed, using local cache:', err)
      }
    }

    // Fallback: Default 32 branches (1/A - 8/D)
    const branches = ['A', 'B', 'C', 'D']
    const classes: SchoolClass[] = []
    for (let grade = 1; grade <= 8; grade++) {
      for (const branch of branches) {
        classes.push({
          id: `class-${grade}-${branch}`,
          name: `${grade}/${branch}`,
          grade,
          branch,
          student_count: grade === 1 && branch === 'A' ? 28 : Math.floor(25 + Math.random() * 7),
          classroom: `${grade <= 2 ? 'Zemin Kat' : `${grade - 1}. Kat`} - Derslik ${grade}0${branches.indexOf(branch) + 1}`,
        })
      }
    }
    return classes
  },

  /**
   * Fetch school announcements
   */
  async getAnnouncements(): Promise<SchoolAnnouncement[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && Array.isArray(data) && data.length > 0) {
          return data
        }
      } catch (err) {
        console.warn('[SchoolService] Supabase announcements failed, using local fallback:', err)
      }
    }

    // Fallback to local storage or defaults
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_school_announcements')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }

    return [
      {
        id: 'ann-1',
        title: '2026-2027 Eğitim Öğretim Yılı 1. Dönem Bilgilendirmesi',
        content: 'Sayın velilerimiz ve değerli öğretmenlerimiz, yeni eğitim öğretim dönemi ders programları sisteme tanımlanmıştır.',
        priority: 'normal',
        target_audience: ['all'],
        sender_name: 'Dr. Uğur UĞURLU',
        sender_role: 'Okul Müdürü',
        created_at: new Date().toISOString(),
      },
      {
        id: 'ann-2',
        title: '1. Sınıflar Okuma Bayramı ve Etkinlik Planı',
        content: '1/A şubesi öğrencilerimizin ilk okuma-yazma kazanım değerlendirmesi cuma günü gerçekleştirilecektir.',
        priority: 'high',
        target_audience: ['students', 'teachers'],
        sender_name: 'Özlem ZOR',
        sender_role: 'Sınıf Öğretmeni',
        created_at: new Date().toISOString(),
      },
    ]
  },

  /**
   * Create and publish a new announcement
   */
  async createAnnouncement(announcement: Omit<SchoolAnnouncement, 'id' | 'created_at'>): Promise<SchoolAnnouncement> {
    const newRecord: SchoolAnnouncement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client
          .from('announcements')
          .insert([newRecord])
          .select()
          .single()

        if (!error && data) {
          return data
        }
      } catch (err) {
        console.warn('[SchoolService] Supabase insert failed, saving to local store:', err)
      }
    }

    // Persist to local cache
    if (typeof window !== 'undefined') {
      try {
        const existing = await this.getAnnouncements()
        const updated = [newRecord, ...existing]
        localStorage.setItem('oxonom_school_announcements', JSON.stringify(updated))
      } catch (_) {}
    }

    return newRecord
  },

  /**
   * Fetch students for a specific class or entire school
   */
  async getStudents(className?: string): Promise<SchoolStudent[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        let query = client.from('students').select('*')
        if (className) {
          query = query.eq('class_name', className)
        }
        const { data, error } = await query

        if (!error && Array.isArray(data) && data.length > 0) {
          return data
        }
      } catch (err) {
        console.warn('[SchoolService] Supabase student query failed, fallback to local:', err)
      }
    }

    // Default primary student: Erçil Uğurlu (1/A, No: 101)
    const baseStudents: SchoolStudent[] = [
      {
        id: 'std-101',
        full_name: 'Erçil UĞURLU',
        student_number: '101',
        class_name: '1/A',
        parent_name: 'Uğur Uğurlu',
        parent_phone: '+90 555 123 4567',
        attendance_status: 'present',
      },
    ]

    return baseStudents
  },

  /**
   * Save student test / assessment results
   */
  async saveTestResult(result: {
    studentId: string
    studentName: string
    courseName: string
    topic: string
    correctCount: number
    wrongCount: number
    emptyCount: number
    score: number
    details?: any
  }) {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        await client.from('student_test_results').insert([
          {
            student_id: result.studentId,
            student_name: result.studentName,
            course_name: result.courseName,
            topic: result.topic,
            correct_count: result.correctCount,
            wrong_count: result.wrongCount,
            empty_count: result.emptyCount,
            score: result.score,
            details: result.details || {},
          },
        ])
      } catch (err) {
        console.warn('[SchoolService] Could not save test result to Supabase:', err)
      }
    }

    // Save to local storage history
    if (typeof window !== 'undefined') {
      try {
        const key = `oxonom_test_history_${result.studentId}`
        const existing = JSON.parse(localStorage.getItem(key) || '[]')
        existing.unshift({ ...result, timestamp: new Date().toISOString() })
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)))
      } catch (_) {}
    }
  },

  /**
   * Save and sync classroom attendance to Supabase
   */
  async saveAttendance(className: string, records: Record<string, string>, presentCount: number, absentCount: number): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        await client.from('daily_attendance').upsert({
          class_name: className,
          date: new Date().toISOString().split('T')[0],
          records,
          present_count: presentCount,
          absent_count: absentCount,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'class_name,date' })
      } catch (err) {
        console.warn('[SchoolService] Supabase attendance save failed:', err)
      }
    }
  },

  /**
   * Dynamically create a new classroom in Supabase
   */
  async createClass(classData: { name: string; grade: number; branch: string; student_count?: number; classroom?: string }): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('classes').insert([classData]).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] createClass error:', err)
      }
    }
    return null
  },

  /**
   * Dynamically update an existing classroom
   */
  async updateClass(id: string, updates: Partial<{ name: string; grade: number; branch: string; student_count: number; classroom: string }>): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('classes').update(updates).eq('id', id).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] updateClass error:', err)
      }
    }
    return null
  },

  /**
   * Dynamically delete a classroom
   */
  async deleteClass(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { error } = await client.from('classes').delete().eq('id', id)
        return !error
      } catch (err) {
        console.warn('[SchoolService] deleteClass error:', err)
      }
    }
    return false
  },

  /**
   * Dynamically create a new student
   */
  async createStudent(studentData: { full_name: string; student_number: string; class_name: string; parent_name?: string; parent_phone?: string }): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('students').insert([studentData]).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] createStudent error:', err)
      }
    }
    return null
  },

  /**
   * Dynamically update student record
   */
  async updateStudent(id: string, updates: Partial<{ full_name: string; student_number: string; class_name: string; parent_name: string; parent_phone: string; attendance_status: string }>): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('students').update(updates).eq('id', id).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] updateStudent error:', err)
      }
    }
    return null
  },

  /**
   * Dynamically delete student record
   */
  async deleteStudent(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { error } = await client.from('students').delete().eq('id', id)
        return !error
      } catch (err) {
        console.warn('[SchoolService] deleteStudent error:', err)
      }
    }
    return false
  },

  /**
   * Fetch dynamic teachers list
   */
  async getTeachers(): Promise<SchoolTeacher[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('teachers').select('*').order('full_name', { ascending: true })
        if (!error && Array.isArray(data)) return data
      } catch (err) {
        console.warn('[SchoolService] getTeachers error:', err)
      }
    }
    return []
  },

  /**
   * Dynamically create a teacher
   */
  async createTeacher(teacherData: { full_name: string; branch: string; email?: string; phone?: string; assigned_classes?: string[]; weekly_hours?: number }): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('teachers').insert([teacherData]).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] createTeacher error:', err)
      }
    }
    return null
  },

  /**
   * Dynamically update a teacher
   */
  async updateTeacher(id: string, updates: Partial<{ full_name: string; branch: string; email: string; phone: string; assigned_classes: string[]; weekly_hours: number }>): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('teachers').update(updates).eq('id', id).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] updateTeacher error:', err)
      }
    }
    return null
  },

  /**
   * Dynamically delete a teacher
   */
  async deleteTeacher(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { error } = await client.from('teachers').delete().eq('id', id)
        return !error
      } catch (err) {
        console.warn('[SchoolService] deleteTeacher error:', err)
      }
    }
    return false
  },

  /**
   * Fetch dynamic schools list
   */
  async getSchools(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('schools').select('*').order('name', { ascending: true })
        if (!error && Array.isArray(data)) return data
      } catch (err) {
        console.warn('[SchoolService] getSchools error:', err)
      }
    }
    return []
  },

  /**
   * Dynamically create a school
   */
  async createSchool(schoolData: { name: string; code: string; city: string; district: string; total_classes?: number }): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('schools').insert([schoolData]).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] createSchool error:', err)
      }
    }
    return null
  },

  /**
   * Dynamically update a school
   */
  async updateSchool(id: string, updates: Partial<{ name: string; code: string; city: string; district: string; total_classes: number }>): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('schools').update(updates).eq('id', id).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] updateSchool error:', err)
      }
    }
    return null
  },

  /**
   * Dynamically delete a school
   */
  async deleteSchool(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { error } = await client.from('schools').delete().eq('id', id)
        return !error
      } catch (err) {
        console.warn('[SchoolService] deleteSchool error:', err)
      }
    }
    return false
  },

  /**
   * Fetch dynamic user profiles
   */
  async getProfiles(role?: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        let query = client.from('profiles').select('*').order('full_name', { ascending: true })
        if (role) {
          query = query.eq('role', role)
        }
        const { data, error } = await query
        if (!error && Array.isArray(data)) return data
      } catch (err) {
        console.warn('[SchoolService] getProfiles error:', err)
      }
    }
    return []
  },

  /**
   * Dynamically update a profile
   */
  async updateProfile(id: string, updates: Partial<{ full_name: string; phone: string; tc_no: string; school_name: string; avatar_url: string }>): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error } = await client.from('profiles').update(updates).eq('id', id).select().single()
        if (!error) return data
      } catch (err) {
        console.warn('[SchoolService] updateProfile error:', err)
      }
    }
    return null
  },
}
