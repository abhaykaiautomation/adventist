"use client";

/*
  OWN-WORLD: Deep indigo ground (#241a5e), warm gold accent (#f6c667),
  cream display type (#f3ede2), rounded-geometric Poppins headline.
  The nav and footer live in the site-wide SiteHeader/SiteFooter (see
  src/app/layout.tsx) — this component is just the hero content between
  them: a headline column with a decorative illustration strip, and a
  circular 3D porthole holding the dice scene. It fills exactly the
  remaining viewport height (h-full on a flex parent) with no internal
  scroll, since the header/footer heights vary and this can't reserve a
  fixed amount of space for them.
*/

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const DiceScene = dynamic(
  () => import("@/components/landing/DiceScene").then((m) => m.DiceScene),
  { ssr: false }
);

// Mirrors the reference's cycling accent word ("Quality" -> "Efficiency" -> ...).
const HEADLINE_WORDS = ["Grows", "Learns", "Shines", "Belongs", "Thrives"];

function useCyclingWord(words: string[], intervalMs: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  return { word: words[index], key: index };
}

function LandingContent() {
  const headline = useCyclingWord(HEADLINE_WORDS, 2200);

  return (
    <main
      className="relative flex h-full w-full flex-col overflow-hidden text-[#f3ede2]"
      style={{
        background:
          "radial-gradient(1400px 900px at 85% 45%, rgba(246,198,103,0.4) 0%, rgba(224,130,79,0.22) 20%, rgba(106,75,201,0.28) 45%, transparent 70%), " +
          "linear-gradient(180deg, #2a1f6e 0%, #241a5e 50%, #1a1246 100%)",
      }}
    >
      {/* Faint decorative orbit rings, echoing the reference's background texture. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute right-[8%] top-[10%] h-[560px] w-[560px] rounded-full border border-[#f3ede2]/10" />
        <div className="absolute right-[14%] top-[16%] h-[440px] w-[440px] rounded-full border border-[#f3ede2]/10" />
      </div>

      <div className="relative z-10 grid flex-1 grid-cols-1 items-center px-6 sm:px-10 md:grid-cols-2">
        {/* Headline column — self-end so its bottom roughly lines up with
            the porthole's lower edge, closing the empty gap below it. */}
        <div className="max-w-3xl md:self-start md:pt-6">
          <div className="h-2 [@media(min-height:850px)]:h-10" aria-hidden="true" />
          <h1
            className="font-[family-name:var(--font-fraunces)] text-4xl leading-[1.08] sm:text-5xl md:text-6xl"
            style={{ fontVariationSettings: '"SOFT" 60, "opsz" 72' }}
          >
            A Place of Excellence, Dedication, and Value
            <br />
            — where your child{" "}
            <span className="whitespace-nowrap">
              <span key={headline.key} className="inline-block animate-word-cycle text-[#f6c667]">
                {headline.word}
              </span>
            </span>
          </h1>

          {/* Decorative illustration strip — a single tidy row rather than
              scattered images, each faded into the indigo ground via a
              radial mask so no white background shows as a hard box. */}
          <div className="mt-3 grid w-fit grid-cols-2 gap-6 [@media(min-height:850px)]:mt-14 [@media(min-height:850px)]:gap-12">
            {[
              "/Children-amico.png",
              "/Mother's Day-bro.png",
              "/International Day of families-amico.png",
              "/Autism-bro.png",
            ].map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden="true"
                className="h-28 w-28 object-contain sm:h-36 sm:w-36 lg:h-36 lg:w-36 [@media(min-height:850px)]:h-56 [@media(min-height:850px)]:w-56"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse 55% 55% at 50% 50%, black 45%, transparent 80%)",
                  maskImage:
                    "radial-gradient(ellipse 55% 55% at 50% 50%, black 45%, transparent 80%)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Circular 3D porthole */}
        <div className="relative hidden items-center justify-center md:flex">
          <div className="absolute h-[540px] w-[540px] rounded-full border border-[#f3ede2]/20" />
          <div
            className="relative h-[460px] w-[460px] overflow-hidden rounded-full"
            style={{
              background:
                "radial-gradient(ellipse 70% 65% at 65% 35%, #f6c667 0%, #e0824f 20%, #6a4bc9 48%, #2c2070 75%, #1a1246 100%)",
            }}
          >
            <DiceScene />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingContent />
    </Suspense>
  );
}
