import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Mission | Troy Adventist Academy Preschool",
  description: "The mission behind Troy Adventist Academy Preschool, from the Parent Handbook.",
};

const COMMITMENTS = [
  {
    title: "Provide",
    body: "a place where children, their families, and their teachers are safe, cherished, welcomed, and respected every day.",
  },
  {
    title: "Create",
    body: "a program of learning that is well planned and rich in developmentally appropriate activities that encourage physical, mental, and emotional growth for every child.",
  },
  {
    title: "Prepare",
    body: "children, their families, and their teachers to have a positive and loving impact on the world around them as they come to understand these fundamental truths.",
  },
];

export default function OurMissionPage() {
  return (
    <main className="flex-1 bg-[#1a1246] px-6 py-16 text-[#f3ede2] sm:px-10">
      <div className="mx-auto max-w-2xl">
        <h1
          className="font-[family-name:var(--font-fraunces)] text-4xl sm:text-5xl"
          style={{ fontVariationSettings: '"SOFT" 60, "opsz" 72' }}
        >
          Our Mission
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-[#f3ede2]/90">
          To love the children and families of our community with the same extravagant love
          that God has given to us&nbsp;&hellip; This is the heartbeat of our mission at{" "}
          <span className="font-semibold text-[#f6c667]">Troy Adventist Academy Preschool</span>.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-[#f3ede2]/90">
          Because of this, we do our best to:
        </p>

        <ol className="mt-8 space-y-6">
          {COMMITMENTS.map((c, i) => (
            <li key={c.title} className="flex gap-4">
              <span
                className="font-[family-name:var(--font-fraunces)] text-2xl text-[#f6c667]"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="text-base leading-relaxed text-[#f3ede2]/90">
                <span className="font-semibold text-[#f3ede2]">{c.title}</span> {c.body}
              </p>
            </li>
          ))}
        </ol>

        <blockquote className="mt-12 text-center font-[family-name:var(--font-fraunces)] text-2xl italic leading-relaxed text-[#f6c667] sm:text-3xl">
          &ldquo;God created me.
          <br />
          He loves me.
          <br />
          He wants me to love other people too.&rdquo;
        </blockquote>
      </div>
    </main>
  );
}
