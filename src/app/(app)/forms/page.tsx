import { redirect } from "next/navigation";

/** The left-nav sidebar already lists every form — this index route just
 * sends "Enrollment" straight into the first step instead of an extra
 * listing page in between. */
export default function FormsIndexPage() {
  redirect("/forms/seed-application-agreement");
}
