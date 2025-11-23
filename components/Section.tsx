'use client';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <section className="w-full max-w-3xl px-4 py-16">
      <h2 className="mb-6 text-4xl md:text-5xl font-merry font-semibold text-black dark:text-white">{title}</h2>
      <div className="space-y-4 text-lg font-unbounded leading-relaxed text-gray-800 dark:text-gray-200">
        {children}
      </div>
    </section>
  );
}

