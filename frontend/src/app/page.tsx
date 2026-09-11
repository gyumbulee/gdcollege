import { Hero } from "@/components/home/Hero";
import { JourneyStrip } from "@/components/home/JourneyStrip";
import { ProgrammesPreview } from "@/components/home/ProgrammesPreview";
import { NoticeBoard } from "@/components/home/NoticeBoard";

export default function HomePage() {
  return (
    <>
      <Hero />
      <JourneyStrip />
      <ProgrammesPreview />
      <NoticeBoard />
    </>
  );
}
