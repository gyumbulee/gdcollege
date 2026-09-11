import { Container } from "@/components/ui/Container";

const steps = [
  { step: "1", title: "Apply", body: "Create an account and submit your application online." },
  { step: "2", title: "Get admitted", body: "Track screening and admission decisions in your portal." },
  { step: "3", title: "Register & pay", body: "Register courses each semester and pay fees online." },
  { step: "4", title: "Graduate", body: "View results, clear your record, and receive your documents." },
];

export function JourneyStrip() {
  return (
    <section className="py-16">
      <Container>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink sm:text-3xl">
          One platform, start to finish
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="border-l-2 border-sky pl-4">
              <span className="text-sm text-sky-dark">{s.step}</span>
              <p className="mt-1 font-medium text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
