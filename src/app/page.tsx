'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Heritage from '@/components/Heritage';
import OccasionSelector from '@/components/OccasionSelector';
import AIStylist from '@/components/AIStylist';
import CustomizationStudio from '@/components/CustomizationStudio';
import AIColorAnalysis from '@/components/AIColorAnalysis';
import CraftsmanshipSection from '@/components/CraftsmanshipSection';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';

export default function Home() {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');

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
        <CustomizationStudio />
        <AIColorAnalysis />
        <CraftsmanshipSection />
        <Gallery />
        <Testimonials />
      </main>

      <Footer />
    </>
  );
}
