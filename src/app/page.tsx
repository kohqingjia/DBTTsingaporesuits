'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Heritage from '@/components/Heritage';
import OccasionSelector from '@/components/OccasionSelector';
import AIStylist from '@/components/AIStylist';
import CustomizationStudio, { SuitConfig } from '@/components/CustomizationStudio';
import AIColorAnalysis from '@/components/AIColorAnalysis';
import CraftsmanshipSection from '@/components/CraftsmanshipSection';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import SentimentAnalytics from '@/components/SentimentAnalytics';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import BookingSection from '@/components/BookingSection';
import CheckoutModal from '@/components/CheckoutModal';

export default function Home() {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutConfig, setCheckoutConfig] = useState<SuitConfig | null>(null);
  const [stylistConfig, setStylistConfig] = useState<Partial<SuitConfig> | undefined>(undefined);

  function handleCheckout(config: SuitConfig) {
    setCheckoutConfig(config);
    setCheckoutOpen(true);
  }

  return (
    <>
      {/* Custom cursor */}
      <CustomCursor />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main>
        {/* ── Discovery ── */}
        <Hero />
        <Heritage />
        <Gallery />
        <CraftsmanshipSection />

        {/* ── Personalisation ── */}
        <AIColorAnalysis />
        <OccasionSelector onSelect={setSelectedOccasion} />
        <AIStylist selectedOccasion={selectedOccasion} onApplyToStudio={setStylistConfig} />

        {/* ── Configuration & Order ── */}
        <CustomizationStudio onCheckout={handleCheckout} initialConfig={stylistConfig} />
        {/* ── Reassurance ── */}
        <BookingSection />
        <Testimonials />
        <SentimentAnalytics />
      </main>

      <Footer />

      {/* Checkout modal — rendered outside main so it overlays everything */}
      {checkoutConfig && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          config={checkoutConfig}
        />
      )}
    </>
  );
}
