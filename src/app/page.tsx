import FeatureSection from '@/components/feature-section';
import LandingNavbar from '@/components/landing-navbar';
import Hero from '@/components/hero';
import UseCase from '@/components/use-case';
import Footer from '@/components/footer';
import Cta from '@/components/cta';
import CTAFooter from '@/components/cta2';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar/>
      <Hero/>
      <UseCase/>
      <Cta/>
      <FeatureSection/>
      <CTAFooter/>
      <Footer/>
    </div>
  );
}