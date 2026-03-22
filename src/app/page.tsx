'use client';

import { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Heritage from '@/components/Heritage';
import CustomizationStudio from '@/components/CustomizationStudio';
import AIColorAnalysis from '@/components/AIColorAnalysis';
import CraftsmanshipSection from '@/components/CraftsmanshipSection';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';

export default function Home() {
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
