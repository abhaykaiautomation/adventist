import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { FormSchema } from "../src/lib/forms/schema";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function asJson(schema: FormSchema): Prisma.InputJsonValue {
  return schema as unknown as Prisma.InputJsonValue;
}

const scheduleAgreement: FormSchema = {
  name: "Schedule and Financial Agreement 2025-26",
  sections: [
    {
      key: "student_info",
      label: "Student Information",
      fields: [
        { key: "child_name", label: "Child's Name", type: "text", required: true },
        { key: "first_day", label: "First Day to Attend", type: "date", required: true },
      ],
    },
    {
      key: "schedule_selection",
      label: "Schedule & Room Selection",
      fields: [
        {
          key: "room",
          label: "Room",
          type: "select",
          required: true,
          options: ["Room 1 (0-24mos)", "Room 2 (24-36mos)", "Preschool (3-4yrs)", "PreK (4-5yrs)"],
        },
        {
          key: "schedule_type",
          label: "Schedule Type",
          type: "select",
          required: true,
          options: [
            "Full Day (7am-6pm)",
            "Half Day (7-1 or 12-6)",
            "School Day (9:30am-3:30pm)",
            "Activity Time (9:30-1, not Room 1)",
          ],
        },
        {
          key: "days_per_week",
          label: "Days per Week",
          type: "select",
          required: true,
          options: ["5 days", "4 days", "3 days", "2 days"],
        },
      ],
    },
    {
      key: "agreement",
      label: "Agreement & Signature",
      fields: [
        {
          key: "policy_ack",
          label: "I acknowledge the no-refund and schedule-change policy",
          type: "checkbox",
          required: true,
        },
      ],
    },
  ],
};

const childInformationRecord: FormSchema = {
  name: "Child Information Record (CCL-3731)",
  sections: [
    {
      key: "contact_info",
      label: "Contact Information",
      fields: [
        { key: "child_name", label: "Child's Name", type: "text", required: true },
        { key: "date_of_birth", label: "Date of Birth", type: "date", required: true },
        { key: "home_address", label: "Home Address", type: "text", required: true },
        { key: "parent_phone", label: "Parent/Guardian Phone", type: "tel", required: true },
      ],
    },
    {
      key: "physician_preference",
      label: "Physician / Hospital Preference",
      fields: [
        { key: "physician_name", label: "Physician Name", type: "text", required: true },
        { key: "physician_phone", label: "Physician Phone", type: "tel", required: true },
        { key: "preferred_hospital", label: "Preferred Hospital", type: "text", required: true },
      ],
    },
    {
      key: "emergency_contacts",
      label: "Emergency Contacts (up to 3)",
      fields: [
        { key: "emergency_contact_1", label: "Emergency Contact 1 (Name & Phone)", type: "text", required: true },
        { key: "emergency_contact_2", label: "Emergency Contact 2 (Name & Phone)", type: "text" },
        { key: "emergency_contact_3", label: "Emergency Contact 3 (Name & Phone)", type: "text" },
      ],
    },
    {
      key: "release_authorization",
      label: "Release-of-Child Authorization (up to 6 names)",
      fields: [
        { key: "release_names", label: "Authorized Names (comma-separated)", type: "textarea" },
      ],
    },
    {
      key: "agreement",
      label: "Signature",
      fields: [
        { key: "consent", label: "I confirm the information above is accurate", type: "checkbox", required: true },
      ],
    },
  ],
};

const healthAppraisal: FormSchema = {
  name: "Health Appraisal (MDHHS-3305)",
  sections: [
    {
      key: "health_history",
      label: "Health History",
      audience: "PARENT",
      fields: [
        { key: "allergies", label: "Known Allergies", type: "textarea" },
        { key: "medications", label: "Current Medications", type: "textarea" },
        { key: "chronic_conditions", label: "Chronic Conditions", type: "textarea" },
      ],
    },
    {
      key: "physical_exam",
      label: "Physical Exam",
      audience: "PHYSICIAN",
      fields: [
        { key: "vision", label: "Vision", type: "text", required: true },
        { key: "hearing", label: "Hearing", type: "text", required: true },
        { key: "urinalysis", label: "Urinalysis", type: "text" },
        { key: "lead_level", label: "Lead Level", type: "text" },
        { key: "height_weight", label: "Height / Weight", type: "text", required: true },
        { key: "blood_pressure", label: "Blood Pressure", type: "text" },
      ],
    },
    {
      key: "immunizations",
      label: "Immunization Record",
      audience: "PHYSICIAN",
      fields: [
        { key: "immunizations_up_to_date", label: "Immunizations up to date?", type: "checkbox" },
        { key: "immunization_notes", label: "Immunization Notes", type: "textarea" },
      ],
    },
    {
      key: "dental",
      label: "Dental Exam Recommendation",
      audience: "PHYSICIAN",
      fields: [{ key: "dental_recommendation", label: "Dental Recommendation", type: "textarea" }],
    },
  ],
};

// --- From Troy Adventist.pdf, pages 3-7 -------------------------------------

const gettingToKnowYourChild: FormSchema = {
  name: "Getting to Know Your Child",
  sections: [
    {
      key: "about_child",
      label: "About Your Child",
      fields: [
        { key: "child_name", label: "Your Child's Name", type: "text", required: true },
        { key: "preferred_name", label: "What Does Your Child Prefer to Be Called", type: "text" },
      ],
    },
    {
      key: "favorites",
      label: "My Child's Favorite Things",
      fields: [
        { key: "favorite_color", label: "Favorite Color", type: "text" },
        { key: "favorite_book", label: "Favorite Book", type: "text" },
        { key: "favorite_toy", label: "Favorite Toy", type: "text" },
        { key: "other_favorites", label: "Other Favorites", type: "textarea" },
      ],
    },
    {
      key: "more_about_child",
      label: "More About Your Child",
      fields: [
        { key: "good_at", label: "My Child Is Good At", type: "textarea" },
        { key: "doesnt_like", label: "My Child Doesn't Like To", type: "textarea" },
        { key: "would_like_you_to_know", label: "I Would Like You to Know This About My Child", type: "textarea" },
        { key: "learns_best_by", label: "My Child Learns Best By", type: "textarea" },
      ],
    },
    {
      key: "likes_to_apply",
      label: "My Child Likes To (Check All That Apply)",
      layout: "grid-2",
      fields: [
        { key: "likes_listen_to_stories", label: "Listen to Stories", type: "checkbox" },
        { key: "likes_draw_and_color", label: "Draw and Color", type: "checkbox" },
        { key: "likes_play_alone", label: "Play Alone", type: "checkbox" },
        { key: "likes_play_with_other_children", label: "Play with Other Children", type: "checkbox" },
        { key: "likes_play_outside", label: "Play Outside", type: "checkbox" },
        { key: "likes_play_quiet_games_inside", label: "Play Quiet Games Inside", type: "checkbox" },
        { key: "likes_go_to_friends_house", label: "Go to Friend's House", type: "checkbox" },
        { key: "likes_play_make_believe", label: "Play Make-Believe", type: "checkbox" },
      ],
    },
  ],
};

const photoUsePermission: FormSchema = {
  name: "Permission for Photo Use",
  sections: [
    {
      key: "permission",
      label: "Photo Permission",
      fields: [
        {
          key: "photo_permission",
          label: "I give my permission for Troy Adventist Academy Preschool to publish photos of my child on the school's website and/or Facebook page",
          type: "checkbox",
          required: true,
          helpText: "Photos will not be labeled with children's names.",
        },
        { key: "child_full_name", label: "Child's Full Name", type: "text", required: true },
        { key: "parent_guardian_name", label: "Parent/Guardian's Name", type: "text", required: true },
      ],
    },
  ],
};

const applicationAgreement: FormSchema = {
  name: "Application Agreement",
  sections: [
    {
      key: "agreement",
      label: "Application Agreement",
      fields: [
        {
          key: "application_agreement",
          label: "I have answered the questions on this application and agree that they are correct. I hereby agree to cooperate with the school in carrying out the announced regulations and those printed in the Policy Handbook",
          type: "checkbox",
          required: true,
        },
      ],
    },
    {
      key: "enrollment_checklist",
      label: "Enrollment Checklist",
      fields: [
        {
          key: "checklist_child_info_form",
          label: "Completed Child Information Form",
          type: "checkbox",
          helpText:
            "Track your own progress toward completing enrollment — all items must be finished before your child can be officially enrolled at TAAP.",
        },
        { key: "checklist_schedule_agreement", label: "Completed Schedule and Financial Agreement", type: "checkbox" },
        {
          key: "checklist_health_or_statement",
          label: "Completed Health Form and Current Immunization Records — OR — Statement of Good Health (school age children)",
          type: "checkbox",
        },
        { key: "checklist_meal_agreement", label: "Signed Written Meal Agreement", type: "checkbox" },
        { key: "checklist_info_packet", label: "Signed Written Information Packet Documentation", type: "checkbox" },
        { key: "checklist_registration_fee", label: "Registration Fee Paid", type: "checkbox" },
        { key: "checklist_curriculum_fee", label: "Curriculum Fee Paid", type: "checkbox" },
        { key: "checklist_food_allergy_policy", label: "Signed Food Allergy Policy", type: "checkbox" },
      ],
    },
  ],
};

const mealAgreement: FormSchema = {
  name: "Written Agreement for Parent-Provided Meals",
  sections: [
    {
      key: "meal_agreement",
      label: "Meal Agreement",
      fields: [
        {
          key: "meal_option",
          label: "Please select the option that applies to your child",
          type: "select",
          required: true,
          helpText:
            "Although TAAP's program includes nutritious vegetarian meals and snacks, the meal program does not include formula or baby food — parents of infants will need to provide the formula and food their little one requires.",
          options: [
            "My child is too young to eat the food TAAP provides — I will provide formula/breastmilk and/or infant food until they are ready for the TAAP lunch program",
            "I may provide some lunches and/or snacks for my child, but I would still like my child to be offered the daily meals/snacks the school provides",
            "I do not want my child to be served/offered any of the food TAAP provides — I will provide daily meals and snacks for my child",
          ],
        },
        {
          key: "meal_labeling_ack",
          label: "I will label any bottles, lunches, snacks, or other food I provide with my child's name, date, and any special storage/heating instructions",
          type: "checkbox",
          required: true,
        },
      ],
    },
  ],
};

const writtenInformationPacket: FormSchema = {
  name: "Written Information Packet Documentation (CCL-4340)",
  sections: [
    {
      key: "child_facility_info",
      label: "Child & Facility Information",
      fields: [
        { key: "children_names", label: "Child(ren)'s Name(s) (Last, First)", type: "textarea", required: true },
        { key: "facility_name_license", label: "Facility's Name and License Number", type: "text" },
      ],
    },
    {
      key: "certification",
      label: "Packet Contents Certification",
      fields: [
        {
          key: "received_all_items",
          label: "I certify that I received all of the above items",
          type: "checkbox",
          required: true,
          helpText:
            "A written information packet has been provided at the time of enrollment, covering (per Michigan Child Care Licensing Bureau rule R 400.8146): criteria for admission and withdrawal; schedule of operation (hours, days, holidays); fee policy; discipline policy; food service program; program philosophy; typical daily routine; parent notification plan for accidents, injuries, incidents, and illnesses; transportation policy (if applicable); medication policy; exclusion policy for child illnesses; and notice of the availability of the center's licensing notebook (TAAP keeps a licensing notebook containing a summary sheet, all licensing inspections and special investigation reports, and related corrective action plans for the last 5 years, available to parents/guardians during regular business hours; reports from at least the past three years are also available at www.michigan.gov/michildcare). A single CCL-4340 form may be used for all children in the same family.",
        },
      ],
    },
  ],
};

const foodAllergyPolicyHtml = `
<h2>Food Allergy Policy</h2>
<p>Food allergies are common in infants and young children, and reactions can range from mild
skin rashes to severe, life-threatening reactions with breathing difficulties, so TAAP works to
reduce the likelihood of a reaction while children are in our care. All staff are trained at time
of hire, before unsupervised contact with children, to recognize allergic-reaction symptoms and
the steps to provide treatment or get emergency help.</p>
<p>When a child with one or more known allergies is enrolled:</p>
<ol>
<li>Parents must provide a Food Allergy Care Plan listing known allergens, prescribed medications
and how to administer them, and the child's typical reactions when exposed — this plan must be
signed by both parents and the child's pediatrician, returned to the school before care can
begin, and reviewed yearly.</li>
<li>Known allergies are posted in the classroom and food-preparation area, with individual care
plans kept in the child's file and posted where caregivers can refer to them immediately.</li>
<li>Center families are notified of known allergies so they can avoid bringing those foods in,
and food-sharing between children or children and staff is prevented.</li>
<li>If a reaction occurs, caregivers follow the child's approved care plan — for a severe
reaction, 911 is called immediately and epinephrine administered if the child has a prescribed
EpiPen, with parents and the director notified immediately.</li>
<li>Any exposure to a known allergen is reported to parents and the director immediately, even
if no reaction appears to occur.</li>
</ol>
`;

const safeSleepPolicyHtml = `
<h2>Safe Sleep Policy</h2>
<p>Placeholder content — replace with the school's actual Safe Sleep Policy text from the
Parent Handbook before going live.</p>
`;

const medicationPolicyHtml = `
<h2>Medication Policy</h2>
<p>Placeholder content — replace with the school's actual Medication Policy text from the
Parent Handbook before going live.</p>
`;

const generalInfoHtml = `
<h2>Parent Handbook — General Information</h2>
<p>Placeholder content covering Sections 1-6 of the handbook (General Info, Daily Activities,
What to Provide, Parental Rights, Health &amp; Safety, Other Info). Replace with the actual
scanned handbook content. This page ends with the parent agreement statement — the binding
signature itself is captured on the enrollment application, not here.</p>
`;

const dailyScheduleHtml = `
<h2>Sample Daily Schedule</h2>
<p>Placeholder content — replace with the school's actual sample daily schedule(s) per room
(e.g. Room 1, Room 2, Preschool, PreK) from the Parent Handbook. Reference-only; not a form
parents fill out.</p>
`;

const paymentCalendarHtml = `
<h2>2025–26 Payment &amp; Session Calendar</h2>
<p>Placeholder content — replace with the actual 2025–26 payment schedule and session/holiday
calendar from the Parent Handbook. Reference-only; not a form parents fill out.</p>
`;

const lunchMenuHtml = `
<h2>Lunch Menu</h2>
<p>Placeholder content — replace with the actual current lunch menu from the Parent Handbook.
Reference-only; not a form parents fill out.</p>
`;

async function main() {
  // Orphaned by the Food Allergy Policy's move from a FormTemplate to a PolicyPage below.
  await prisma.formTemplate.deleteMany({ where: { id: "seed-food-allergy-policy-form" } });

  // From Troy Adventist.pdf, pages 3-7. Sorts first in the Forms nav.
  await prisma.formTemplate.upsert({
    where: { id: "seed-getting-to-know-your-child" },
    update: { schemaJson: asJson(gettingToKnowYourChild), isActive: true, sortOrder: 0 },
    create: {
      id: "seed-getting-to-know-your-child",
      name: gettingToKnowYourChild.name,
      schemaJson: asJson(gettingToKnowYourChild),
      sortOrder: 0,
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-schedule-agreement" },
    update: { schemaJson: asJson(scheduleAgreement), isActive: true, sortOrder: 1 },
    create: {
      id: "seed-schedule-agreement",
      name: scheduleAgreement.name,
      schemaJson: asJson(scheduleAgreement),
      sortOrder: 1,
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-child-info-record" },
    update: { schemaJson: asJson(childInformationRecord), isActive: true, sortOrder: 2 },
    create: {
      id: "seed-child-info-record",
      name: childInformationRecord.name,
      schemaJson: asJson(childInformationRecord),
      sortOrder: 2,
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-health-appraisal" },
    update: { schemaJson: asJson(healthAppraisal), isActive: true, sortOrder: 3 },
    create: {
      id: "seed-health-appraisal",
      name: healthAppraisal.name,
      schemaJson: asJson(healthAppraisal),
      sortOrder: 3,
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-photo-use-permission" },
    update: { schemaJson: asJson(photoUsePermission), isActive: true, sortOrder: 4 },
    create: {
      id: "seed-photo-use-permission",
      name: photoUsePermission.name,
      schemaJson: asJson(photoUsePermission),
      sortOrder: 4,
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-application-agreement" },
    update: { schemaJson: asJson(applicationAgreement), isActive: true, sortOrder: 5 },
    create: {
      id: "seed-application-agreement",
      name: applicationAgreement.name,
      schemaJson: asJson(applicationAgreement),
      sortOrder: 5,
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-meal-agreement" },
    update: { schemaJson: asJson(mealAgreement), isActive: true, sortOrder: 6 },
    create: {
      id: "seed-meal-agreement",
      name: mealAgreement.name,
      schemaJson: asJson(mealAgreement),
      sortOrder: 6,
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-written-information-packet" },
    update: { schemaJson: asJson(writtenInformationPacket), isActive: true, sortOrder: 7 },
    create: {
      id: "seed-written-information-packet",
      name: writtenInformationPacket.name,
      schemaJson: asJson(writtenInformationPacket),
      sortOrder: 7,
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-food-allergy-policy" },
    update: { contentHtml: foodAllergyPolicyHtml, requiresAcknowledgment: true, sortOrder: 0 },
    create: {
      id: "seed-food-allergy-policy",
      title: "Food Allergy Policy",
      contentHtml: foodAllergyPolicyHtml,
      requiresAcknowledgment: true,
      sortOrder: 0,
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-safe-sleep-policy" },
    update: { contentHtml: safeSleepPolicyHtml, requiresAcknowledgment: true, sortOrder: 1 },
    create: {
      id: "seed-safe-sleep-policy",
      title: "Safe Sleep Policy",
      contentHtml: safeSleepPolicyHtml,
      requiresAcknowledgment: true,
      sortOrder: 1,
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-medication-policy" },
    update: { contentHtml: medicationPolicyHtml, requiresAcknowledgment: true, sortOrder: 2 },
    create: {
      id: "seed-medication-policy",
      title: "Medication Policy",
      contentHtml: medicationPolicyHtml,
      requiresAcknowledgment: true,
      sortOrder: 2,
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-general-info" },
    update: { contentHtml: generalInfoHtml, requiresAcknowledgment: true, sortOrder: 3 },
    create: {
      id: "seed-general-info",
      title: "Parent Handbook — General Information",
      contentHtml: generalInfoHtml,
      requiresAcknowledgment: true,
      sortOrder: 3,
    },
  });

  // Reference-only pages — no parent sign-off needed, per Section 2 of the spec.
  await prisma.policyPage.upsert({
    where: { id: "seed-daily-schedule" },
    update: { contentHtml: dailyScheduleHtml, requiresAcknowledgment: false, sortOrder: 4 },
    create: {
      id: "seed-daily-schedule",
      title: "Sample Daily Schedule",
      contentHtml: dailyScheduleHtml,
      requiresAcknowledgment: false,
      sortOrder: 4,
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-payment-calendar" },
    update: { contentHtml: paymentCalendarHtml, requiresAcknowledgment: false, sortOrder: 5 },
    create: {
      id: "seed-payment-calendar",
      title: "2025–26 Payment & Session Calendar",
      contentHtml: paymentCalendarHtml,
      requiresAcknowledgment: false,
      sortOrder: 5,
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-lunch-menu" },
    update: { contentHtml: lunchMenuHtml, requiresAcknowledgment: false, sortOrder: 6 },
    create: {
      id: "seed-lunch-menu",
      title: "Lunch Menu",
      contentHtml: lunchMenuHtml,
      requiresAcknowledgment: false,
      sortOrder: 6,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
