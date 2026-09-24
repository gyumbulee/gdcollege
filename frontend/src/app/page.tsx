import { Hero } from "@/components/home/Hero";
import { JourneyStrip } from "@/components/home/JourneyStrip";
import { ProgrammesPreview } from "@/components/home/ProgrammesPreview";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { NoticeBoard } from "@/components/home/NoticeBoard";
import { BannerPopup } from "@/components/home/BannerPopup";

export default async function HomePage() {
  return (
    <>
      <BannerPopup />
      <Hero />
      <JourneyStrip />
      <FeaturedCarousel />
      <ProgrammesPreview />
      <NoticeBoard />
    </>
  );
}
