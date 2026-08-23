"use client";

/*
  THESIS: The Replit replica's layout (nav bar, circular-framed visual,
  numbered caption, dual CTA row) carried over, but the color/type theme
  swapped back to the original site's palette — indigo ground, gold accent.
  OWN-WORLD: Deep indigo ground (#241a5e), warm gold accent (#f6c667),
  cream display type (#f3ede2), rounded-geometric Poppins headline; small
  tracked-caps labels throughout (nav, eyebrow, captions).
  STORY: unchanged — a bold rotating value statement, a supporting line,
  two calls to action, a framed visual, a secondary "meet the team" box.
  FIRST VIEWPORT: floating-free nav bar (not a pill), left headline column,
  right circular 3D porthole with orbit ring + caption, bottom-left counter,
  bottom-right bordered box.
  FORM: Explicit "just the theme" request — palette/typography swap only,
  layout untouched; no concept-seed roll.
  FINISH: nav labels, headline copy, captions, and counter are placeholder
  by explicit agreement (content to be supplied later).
*/

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const MoleculeScene = dynamic(
  () => import("@/components/landing/MoleculeScene").then((m) => m.MoleculeScene),
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
  const { appUser, loading, signIn, signOut } = useAuth();
  const headline = useCyclingWord(HEADLINE_WORDS, 2200);

  const firstName = appUser?.name?.split(" ")[0] || appUser?.email?.split("@")[0];

  return (
    <main
      className="relative flex h-screen w-full flex-col overflow-hidden text-[#f3ede2]"
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

      {/* Nav */}
      <nav className="relative z-10 flex shrink-0 items-center justify-between border-b border-[#f3ede2]/10 px-6 py-4 sm:px-10">
        <div
          className="font-[family-name:var(--font-fraunces)] text-xl font-semibold sm:text-2xl"
          style={{ fontVariationSettings: '"SOFT" 40, "opsz" 30' }}
        >
          Troy Adventist Academy &amp; Preschool
        </div>

        <div className="flex items-center gap-6 text-xs font-medium uppercase tracking-wide">
          {appUser ? (
            <Link href="/forms" className="flex items-center gap-1 text-[#f6c667]">
              Enrollment <span aria-hidden="true">&#8599;</span>
            </Link>
          ) : (
            <button onClick={() => signIn()} className="flex items-center gap-1 text-[#f6c667]">
              Enrollment <span aria-hidden="true">&#8599;</span>
            </button>
          )}

          {loading ? null : appUser ? (
            <div className="flex items-center gap-3 normal-case text-[#f3ede2]">
              <span>
                Hello, <span className="font-semibold">{firstName}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="text-[#f3ede2]/60 uppercase tracking-wide hover:text-[#f3ede2]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => signIn()} className="text-[#f3ede2]">
                Sign In
              </button>
              {!loading && (
                <p className="absolute right-0 top-full mt-2 whitespace-nowrap normal-case text-[#f6c667]">
                  Please sign in to continue — everything past this page requires a Google account.
                </p>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 grid flex-1 grid-cols-1 items-center px-6 sm:px-10 md:grid-cols-2">
        {/* Headline column — self-end so its bottom roughly lines up with
            the porthole's lower edge, closing the empty gap below it. */}
        <div className="max-w-3xl md:self-end md:pb-16">
          {/* Decorative illustration strip — a single tidy row rather than
              scattered images, each faded into the indigo ground via a
              radial mask so no white background shows as a hard box. */}
          <div className="mb-4 grid w-fit grid-cols-2 gap-12">
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
                className="h-40 w-40 object-contain sm:h-52 sm:w-52"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse 55% 55% at 50% 50%, black 45%, transparent 80%)",
                  maskImage:
                    "radial-gradient(ellipse 55% 55% at 50% 50%, black 45%, transparent 80%)",
                }}
              />
            ))}
          </div>

          <h1
            className="font-[family-name:var(--font-fraunces)] text-5xl leading-[1.08] sm:text-6xl md:text-7xl"
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
            <MoleculeScene />
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="relative z-10 flex shrink-0 items-center justify-between border-t border-[#f3ede2]/10 px-6 py-4 sm:px-10">
        <div className="flex items-baseline gap-2 text-2xl font-semibold text-[#f6c667]">
          000<span className="text-xs font-normal text-[#f3ede2]/50">/ 100</span>
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
