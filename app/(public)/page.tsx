'use client';

import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-section';
import HowItWorksSection from '@/components/how-it-work-section';
import CtaBanner from '@/components/cta-banner-section';

export default function LandingPage() {
    const { currentUser } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar currentUser={currentUser} />
            <main className="flex-grow">
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <CtaBanner />
            </main>
            <Footer />
        </div>
    );
}
