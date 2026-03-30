'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Heritage from '@/components/Heritage';
import OccasionSelector from '@/components/OccasionSelector';
import AIStylist from '@/components/AIStylist';
import CustomizationStudio, { SuitConfig } from '@/components/CustomizationStudio';
import BodyScan3D from '@/components/BodyScan3D';
import AIColorAnalysis from '@/components/AIColorAnalysis';
import CraftsmanshipSection from '@/components/CraftsmanshipSection';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import CheckoutModal from '@/components/CheckoutModal';

export default function Home() {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutConfig, setCheckoutConfig] = useState<SuitConfig | null>(null);

  function handleCheckout(config: SuitConfig) {
    setCheckoutConfig(config);
    setCheckoutOpen(true);
  }

  return (
    <>
      {/* Film grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Custom cursor */}
      <CustomCursor />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main>
        <Hero />
        <Heritage />
        <OccasionSelector onSelect={setSelectedOccasion} />
        <AIStylist selectedOccasion={selectedOccasion} />
        <CustomizationStudio onCheckout={handleCheckout} />
        <BodyScan3D />
        <AIColorAnalysis />
        <CraftsmanshipSection />
        <Gallery />
        <Testimonials />
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
