import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Uploader from "@/components/Uploader";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { deadlineEvent } from "@/lib/jsonld";

export default function Home() {
  return (
    <>
      <JsonLd data={deadlineEvent()} />
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Uploader />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
