import React from 'react';
import PromoNavbar from '@components/Promo/PromoNavbar';
import PromoFooter from '@components/Promo/PromoFooter';

export default function PromoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9FD] text-[#241329] selection:bg-[#D914C8] selection:text-white">
      <PromoNavbar />
      <div className="flex-grow">
        {children}
      </div>
      <PromoFooter />
    </div>
  );
}
