import type { Metadata } from 'next';
import PromoHero from '@components/Promo/PromoHero';
import StudentPortalShowcase from '@components/Promo/StudentPortalShowcase';
import StudentInteractiveTabs from '@components/Promo/StudentInteractiveTabs';
import PromoFeatures from '@components/Promo/PromoFeatures';
import PricingTables from '@components/Promo/PricingTables';
import PromoFAQ from '@components/Promo/PromoFAQ';
import PromoCTASection from '@components/Promo/PromoCTASection';
import JsonLd from '@components/Promo/JsonLd';

export const metadata: Metadata = {
  title: 'Oxonom Edu | 1. Sınıftan 8. Sınıfa Akıllı Tahta ve Eğitim Portalı',
  description: 'Yeni nesil interaktif akıllı tahta, okul-ev entegrasyonu, 1 Dk Hızlı Okuma, MEB müfredatına tam uyumlu ders tekrarları ve 14 gün ücretsiz deneme.',
  keywords: 'oxonom edu, akıllı tahta, okul yönetim sistemi, k-12 lms, öğrenci portalı, meb müfredatı, hızlı okuma',
  openGraph: {
    title: 'Oxonom Edu — Akıllı Tahta & Eğitim Portalı',
    description: 'Sınıftaki eğitimi eve taşıyan MEB uyumlu yeni nesil öğrenci ekosistemi.',
    url: 'https://edu.oxonom.com',
    siteName: 'Oxonom Edu',
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function HomePage() {
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Oxonom Edu',
    url: 'https://edu.oxonom.com',
    logo: 'https://edu.oxonom.com/oxonom-edu-logo.png',
    description: '1. sınıftan 8. sınıfa kadar MEB müfredatı ile tam entegre akıllı tahta ve öğrenci eğitim platformu.',
    sameAs: [
      'https://instagram.com/oxonomedu',
      'https://facebook.com/oxonomedu',
      'https://x.com/oxonomedu',
    ],
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PromoHero />
      <StudentPortalShowcase />
      <StudentInteractiveTabs />
      <PromoFeatures />
      <PricingTables />
      <PromoFAQ />
      <PromoCTASection />
    </>
  );
}
