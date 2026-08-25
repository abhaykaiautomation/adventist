/** The one footer shown at the bottom of every page. */
export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-[#f3ede2]/10 bg-[#1a1246] px-6 py-3 text-xs text-[#cdc4ec] sm:px-10">
      &copy; {new Date().getFullYear()} Troy Adventist Academy &amp; Preschool. All rights reserved.
    </footer>
  );
}
