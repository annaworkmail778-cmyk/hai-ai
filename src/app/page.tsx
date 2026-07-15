import Navbar from "@/components/Navbar";
import DemoScroll from "@/components/DemoScroll";
import Hero from "@/components/Hero";
import StoryCinema from "@/components/StoryCinema";
import About from "@/components/About";
import Services from "@/components/Services";
import Problems from "@/components/Problems";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";
import Results from "@/components/Results";
import Pricing from "@/components/Pricing";
import Roi from "@/components/Roi";
import FeatureMatrix from "@/components/FeatureMatrix";
import AddOns from "@/components/AddOns";
import Testimonials from "@/components/Testimonials";
import Reels from "@/components/Reels";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <DemoScroll />
      <Navbar />
      <main>
        <Hero />
        <StoryCinema />
        <About />
        <Services />
        <Problems />
        <HowItWorks />
        <WhyChooseUs />
        <Results />
        <Pricing />
        <Roi />
        <FeatureMatrix />
        <AddOns />
        <Testimonials />
        <Reels />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
