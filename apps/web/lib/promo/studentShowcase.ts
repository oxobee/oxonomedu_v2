export interface StudentShowcaseSettings {
  portalImageUrl: string;
  badgeText: string;
  sectionTitle: string;
  sectionSubtitle: string;
  ctaText: string;
  ctaUrl: string;
  lastUpdated?: string;
}

const STORAGE_KEY = 'oxonom_student_showcase_settings';

export const DEFAULT_STUDENT_SHOWCASE_SETTINGS: StudentShowcaseSettings = {
  portalImageUrl: '/student-portal-desktop.png',
  badgeText: 'YENİ NESİL ÖĞRENCİ PORTALI',
  sectionTitle: 'Öğrenciler İçin Tasarlanmış Akıllı Eğitim Ekranı',
  sectionSubtitle:
    'Dersler, ödevler, akıllı tahta notları ve anlık akademik başarı takibi. Öğrencilerin okulda ve evde severek çalıştığı, başarı motivasyonu aşılayan modern arayüz.',
  ctaText: 'Demo Hesap İncele',
  ctaUrl: 'https://edu.oxonom.com/login',
};

export function getStudentShowcaseSettings(): StudentShowcaseSettings {
  if (typeof window === 'undefined') return DEFAULT_STUDENT_SHOWCASE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STUDENT_SHOWCASE_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STUDENT_SHOWCASE_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Error reading student showcase settings:', e);
    return DEFAULT_STUDENT_SHOWCASE_SETTINGS;
  }
}

export function saveStudentShowcaseSettings(
  settings: Partial<StudentShowcaseSettings>
): StudentShowcaseSettings {
  const current = getStudentShowcaseSettings();
  const updated: StudentShowcaseSettings = {
    ...current,
    ...settings,
    lastUpdated: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('oxonom_student_showcase_updated', { detail: updated })
    );
  } catch (e) {
    console.error('Error saving student showcase settings:', e);
  }
  return updated;
}

export function resetStudentShowcaseSettings(): StudentShowcaseSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent('oxonom_student_showcase_updated', {
        detail: DEFAULT_STUDENT_SHOWCASE_SETTINGS,
      })
    );
  } catch (e) {
    console.error('Error resetting student showcase settings:', e);
  }
  return DEFAULT_STUDENT_SHOWCASE_SETTINGS;
}

export function subscribeToStudentShowcaseUpdates(
  callback: (settings: StudentShowcaseSettings) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<StudentShowcaseSettings>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getStudentShowcaseSettings());
    }
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback(getStudentShowcaseSettings());
    }
  };

  window.addEventListener('oxonom_student_showcase_updated', handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener('oxonom_student_showcase_updated', handler);
    window.removeEventListener('storage', storageHandler);
  };
}
