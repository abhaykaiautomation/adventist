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
      key: "other_charges",
      label: "Other Charges",
      fields: [
        {
          key: "other_charges_note",
          type: "note",
          label: "",
          helpText:
            "Registration for New Students (non refundable): $100\n" +
            "Curriculum Fee (September–May) (non refundable): $200\n" +
            "Summer Activity Fee (June–August) (non refundable): $150\n" +
            "Late arrival charge (past 6pm), paid immediately to the caregiver on duty: $1.00/minute\n\n" +
            "Make checks payable to TAAP and write your child's full name in the memo line on the check (returned checks may be subject to a $30 NSF fee). There are no refunds for sick days, vacations, or holidays. Schedule changes may be made at the beginning of each month. Special circumstances may be discussed with the director/treasurer.\n\n" +
            "Tuition rates are based on four 12-week sessions, with three equal payments in each session. The monthly payment covers a 4-week segment of the session.",
        },
      ],
    },
    {
      key: "agreement",
      label: "Agreement & Signature",
      fields: [
        {
          key: "policy_ack",
          label: "I have read the financial information contained in this application and the policy handbook, and I agree to abide by the terms, conditions, and consequences described therein. I accept the financial obligation of this student and agree to make regular payments to the account as outlined or as mutually agreed upon.",
          type: "checkbox",
          required: true,
        },
        { key: "monthly_tuition_amount", label: "I agree to pay $ ___ /month in tuition", type: "number", required: true, row: "tuition_payment" },
        {
          key: "payment_method",
          label: "Payment Method",
          type: "select",
          required: true,
          options: ["Pay Online (autopay)", "Pay in Person (cash/check at the school office)"],
          row: "tuition_payment",
        },
      ],
    },
  ],
};

const childInformationRecord: FormSchema = {
  name: "Child Information Record (CCL-3731)",
  sections: [
    {
      key: "child_info",
      label: "Child Information",
      fields: [
        { key: "child_name", label: "Name of Child (Last, First, Middle Initial)", type: "text", required: true, row: "name_dob" },
        { key: "date_of_birth", label: "Child's Date of Birth", type: "date", required: true, row: "name_dob" },
        { key: "address_street", label: "Address (Number and Street, Building/Apartment Number)", type: "text", required: true },
        { key: "address_city", label: "City", type: "text", required: true, row: "city_state_zip" },
        { key: "address_state", label: "State", type: "text", required: true, row: "city_state_zip" },
        { key: "address_zip", label: "Zip Code", type: "text", required: true, row: "city_state_zip" },
      ],
    },
    {
      key: "guardian_1",
      label: "Parent/Legal Guardian",
      fields: [
        { key: "name", label: "Parent/Legal Guardian's Name", type: "text", required: true, row: "name_phone" },
        { key: "primary_phone", label: "Primary Phone", type: "tel", required: true, row: "name_phone" },
        { key: "home_address", label: "Home Address (if not child's address)", type: "text", row: "address_phone" },
        { key: "second_phone", label: "2nd Phone (if applicable)", type: "tel", row: "address_phone" },
        { key: "city", label: "City", type: "text", row: "city_state_zip" },
        { key: "state", label: "State", type: "text", row: "city_state_zip" },
        { key: "zip", label: "Zip Code", type: "text", row: "city_state_zip" },
        { key: "email", label: "Email Address", type: "email", required: true },
        { key: "employer_name", label: "Employer Name", type: "text", row: "employer_phone" },
        { key: "work_phone", label: "Work Phone", type: "tel", row: "employer_phone" },
      ],
    },
    {
      key: "guardian_2",
      label: "Parent/Legal Guardian (Optional)",
      fields: [
        { key: "name", label: "Parent/Legal Guardian's Name (Optional)", type: "text", row: "name_phone" },
        { key: "primary_phone", label: "Primary Phone", type: "tel", row: "name_phone" },
        { key: "home_address", label: "Home Address (if not child's address)", type: "text", row: "address_phone" },
        { key: "second_phone", label: "2nd Phone (if applicable)", type: "tel", row: "address_phone" },
        { key: "city", label: "City", type: "text", row: "city_state_zip" },
        { key: "state", label: "State", type: "text", row: "city_state_zip" },
        { key: "zip", label: "Zip Code", type: "text", row: "city_state_zip" },
        { key: "email", label: "Email Address", type: "email" },
        { key: "employer_name", label: "Employer Name", type: "text", row: "employer_phone" },
        { key: "work_phone", label: "Work Phone", type: "tel", row: "employer_phone" },
      ],
    },
    {
      key: "physician_preference",
      label: "Physician / Hospital",
      fields: [
        { key: "physician_name", label: "Name of Child's Physician or Health Clinic", type: "text", required: true },
        { key: "physician_phone", label: "Physician's or Health Clinic's Phone Number", type: "tel", required: true },
        { key: "preferred_hospital", label: "Hospital Preferred for Emergency Treatment (optional)", type: "text" },
      ],
    },
    {
      key: "allergies",
      label: "Allergies, Special Needs and/or Special Instructions",
      fields: [
        {
          key: "has_allergies",
          label: "Allergies, Special Needs and/or Special Instructions?",
          type: "select",
          options: ["No", "Yes"],
          required: true,
        },
        { key: "allergies_explain", label: "If yes, explain", type: "textarea" },
      ],
    },
    {
      key: "emergency_contacts",
      label: "Emergency Contact & Release of Child",
      fields: [
        {
          key: "emergency_contacts_intro",
          type: "note",
          label: "",
          helpText:
            "List all individuals, including parents/legal guardians, in order of preference, to be contacted in an emergency. If possible, include at least one person other than the parents/legal guardians to be contacted in an emergency and to whom the child can be released.",
        },
      ],
      repeatable: {
        minRows: 2,
        addLabel: "+ Add emergency contact",
        rowFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "phone_1", label: "Phone", type: "tel" },
          { key: "phone_2", label: "2nd Phone", type: "tel" },
        ],
      },
    },
    {
      key: "release_of_child",
      label: "Release of Child Only",
      fields: [
        {
          key: "release_intro",
          type: "note",
          label: "",
          helpText: "List all individuals, other than the parents/legal guardians, to whom the child may be released.",
        },
      ],
      repeatable: {
        minRows: 1,
        addLabel: "+ Add name",
        rowFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "phone", label: "Phone", type: "tel" },
        ],
      },
    },
    {
      key: "agreement",
      label: "Permission & Certification",
      fields: [
        { key: "guardian_initials", label: "Parent/Legal Guardian Initials", type: "text", required: true },
        {
          key: "medical_permission_notice",
          type: "note",
          label: "",
          helpText:
            "I give permission to Troy Adventist Academy Preschool, licensed by the Department of Lifelong Education, Advancement, and Potential, to secure emergency medical treatment for the above named minor child while in care.",
        },
        {
          key: "consent",
          label: "I certify that I accurately completed this form and if anything changes, I will notify the provider by updating this form",
          type: "checkbox",
          required: true,
        },
      ],
    },
  ],
};

const YES_NO = ["Yes", "No"];
const YES_NO_RESOLVED = ["Yes", "No", "Resolved"];
const NORMAL_REFERRED_UNDER_CARE = ["Normal", "Referred", "Under Care"];

const healthAppraisal: FormSchema = {
  name: "Health Appraisal (MDHHS-3305)",
  sections: [
    {
      key: "personal_info",
      label: "Section 1 — Personal",
      audience: "PARENT",
      fields: [
        {
          key: "form_intro",
          type: "note",
          label: "",
          helpText:
            "Dear Parent or Guardian: The following information is requested so that the school can work with the parent to meet the physical, intellectual, and emotional needs of the child. Fill out the information requested in Section 1. Section 4 may be certified by the transcription of information from the certificate of immunization. The remaining sections are to be completed by a doctor, nurse, dentist, dental therapist, and dental hygienist.\n\nBe sure to bring your child's immunization records to the examination.",
        },
        { key: "child_name", label: "Child's Name (Last, First, Middle)", type: "text", required: true, row: "r1" },
        { key: "date_of_birth", label: "Date of Birth", type: "date", required: true, row: "r1" },
        { key: "child_address", label: "Address (Number, Street, City, Zip Code)", type: "text", required: true, row: "r2" },
        { key: "todays_date", label: "Today's Date", type: "date", required: true, row: "r2" },
        { key: "guardian_name", label: "Parent/Guardian (Last, First, Middle)", type: "text", required: true, row: "r3" },
        { key: "guardian_home_cell_phone", label: "Home/Cell Phone Number", type: "tel", required: true, row: "r3" },
        { key: "guardian_address", label: "Address (Number, Street, City, Zip Code)", type: "text", row: "r4" },
        { key: "guardian_work_phone", label: "Work Phone Number", type: "tel", row: "r4" },
      ],
    },
    {
      key: "health_history",
      label: "Section 2 — Health History",
      audience: "PARENT",
      fields: [
        {
          key: "health_history_intro",
          type: "note",
          label: "",
          helpText: "Is your child having any of the problems listed below? For each, mark Yes, No, or Resolved.",
        },
        { key: "allergies_or_reactions", label: "1. Allergies or Reactions (for example, food, medication or other)", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "anaphylaxis", label: "2. Anaphylaxis", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "takes_medication", label: "3. Does your child take any medication(s) regularly?", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "medications_list", label: "If yes, list medications", type: "textarea" },
        { key: "hay_fever_asthma_wheezing", label: "4. Hay Fever, Asthma, or Wheezing", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "eczema_skin_rashes", label: "5. Eczema or Frequent Skin Rashes", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "convulsions_seizures", label: "6. Convulsions/Seizures", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "heart_trouble", label: "7. Heart Trouble", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "diabetes", label: "8. Diabetes", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "frequent_colds_sore_throats_earaches", label: "9. Frequent Colds, Sore Throats, Earaches (4 or more per year)", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "current_or_past_diagnosis", label: "Are there any current or past diagnosis(es)?", type: "select", options: YES_NO },
        { key: "trouble_urine_bowel", label: "10. Trouble with Passing Urine or Bowel Movements", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "trouble_urine_bowel_explain", label: "If yes, describe", type: "textarea" },
        { key: "shortness_of_breath", label: "11. Shortness of Breath", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "speech_problems", label: "12. Speech Problems", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "menstrual_problems", label: "13. Menstrual Problems", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "dental_problems", label: "14. Dental Problems", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "dental_last_exam_or_assessment_date", label: "Date of Last Exam OR Date of Last Assessment", type: "date" },
        { key: "other_problem", label: "15. Other", type: "select", options: YES_NO_RESOLVED, required: true },
        { key: "other_problem_describe", label: "Other (describe)", type: "text" },
        { key: "reason_for_medication", label: "Reason for Medication", type: "textarea" },
        { key: "concussion_history", label: "Concussion History", type: "textarea" },
        {
          key: "health_history_certify",
          label: "I certify that the health history information provided above is accurate",
          type: "checkbox",
          required: true,
        },
      ],
    },
    {
      key: "health_history_review",
      label: "Reviewed By Health Professional",
      fields: [
        { key: "history_reviewed", label: "Was the health history reviewed by a health professional?", type: "select", options: YES_NO, required: true, row: "r1" },
        { key: "examiner_initials", label: "Examiner's Initials", type: "text", row: "r1" },
      ],
    },
    {
      key: "physical_exam",
      label: "Section 3 — Physical Examination, Inspection, Tests and Measurements",
      fields: [
        {
          key: "physical_exam_intro",
          type: "note",
          label: "",
          helpText: "Required for Child Care and Head Start / Early Head Start.",
        },
        { key: "vision_tested", label: "Was child tested — Vision?", type: "select", options: YES_NO, row: "vision1" },
        { key: "vision_date", label: "Date", type: "date", row: "vision1" },
        {
          key: "vision_results",
          label: "Vision — Tests and Results",
          type: "textarea",
          helpText: "Visual Acuity / Muscle Imbalance / Other — mark Normal, Referred, or Under Care for each.",
        },
        { key: "hearing_tested", label: "Was child tested — Hearing?", type: "select", options: YES_NO, row: "hearing1" },
        { key: "hearing_date", label: "Date", type: "date", row: "hearing1" },
        {
          key: "hearing_results",
          label: "Hearing — Tests and Results",
          type: "textarea",
          helpText: "Audiometer / OAE / Other — note R (Right) and L (Left) results.",
        },
        { key: "urinalysis_tested", label: "Was child tested — Urinalysis?", type: "select", options: YES_NO },
        {
          key: "urinalysis_results",
          label: "Urinalysis — Tests and Results",
          type: "textarea",
          helpText: "Sugar / Albumin / Microscopic — mark Normal, Referred, or Under Care for each.",
        },
        { key: "blood_lead_tested", label: "Was child tested — Blood Lead Level?", type: "select", options: YES_NO, row: "lead1" },
        { key: "blood_lead_date", label: "Date", type: "date", row: "lead1" },
        { key: "blood_lead_level", label: "Level (ug/dl)", type: "text", row: "lead2" },
        { key: "blood_lead_result", label: "Result", type: "select", options: NORMAL_REFERRED_UNDER_CARE, row: "lead2" },
        {
          key: "tb_risk_note",
          type: "note",
          label: "",
          helpText:
            "Complete pediatric tuberculosis risk assessment available at: https://www.michigan.gov/documents/mdhhs/4._MI_Pediatric_TB_Risk_Assessment_661537_7.pdf",
        },
        { key: "height", label: "Height", type: "text", row: "hw1" },
        { key: "weight", label: "Weight", type: "text", row: "hw1" },
        { key: "height_weight_result", label: "Height/Weight Result", type: "select", options: NORMAL_REFERRED_UNDER_CARE },
        { key: "other_measurement", label: "Other", type: "text" },
        { key: "hemoglobin_hematocrit_tested", label: "Was child tested — Hemoglobin/Hematocrit?", type: "select", options: YES_NO, row: "hgb1" },
        { key: "hemoglobin_result", label: "Result", type: "select", options: NORMAL_REFERRED_UNDER_CARE, row: "hgb1" },
        { key: "blood_pressure_tested", label: "Was child tested — Blood Pressure?", type: "select", options: YES_NO, row: "bp1" },
        { key: "blood_pressure_reading", label: "Reading", type: "text", row: "bp1" },
        { key: "blood_pressure_result", label: "Result", type: "select", options: NORMAL_REFERRED_UNDER_CARE, row: "bp1" },
        { key: "essential_findings", label: "Essential Findings Deviating from Normal", type: "textarea", row: "findings1" },
        { key: "exam_date", label: "Exam Date", type: "date", row: "findings1" },
      ],
    },
    {
      key: "immunizations",
      label: "Section 4 — Immunizations",
      fields: [
        {
          key: "immunizations_intro",
          type: "note",
          label: "",
          helpText:
            'Statements such as "UP-TO-DATE" or "COMPLETE" will not be accepted. Admission to school may be denied based on this information.',
        },
        { key: "hepatitis_b_dates", label: "Hepatitis B (HepB) — Dates Administered (up to 4 doses)", type: "text" },
        { key: "dtap_dates", label: "DTaP/DTP/DT/Td — Dates Administered (up to 6 doses)", type: "text" },
        { key: "tdap_date", label: "Tdap — Date Administered", type: "date" },
        { key: "hib_dates", label: "Haemophilus Influenzae type b (HIB) — Dates Administered (up to 4 doses)", type: "text" },
        { key: "polio_dates", label: "Polio (IPV/OPV) — Dates Administered (up to 5 doses)", type: "text" },
        { key: "pcv_dates", label: "Pneumococcal Conjugate (PCV) — Dates Administered (up to 4 doses)", type: "text" },
        { key: "rotavirus_dates", label: "Rotavirus (RV1/RV5) — Dates Administered (up to 3 doses)", type: "text" },
        { key: "mmr_dates", label: "Measles, Mumps, Rubella (MMR/MMRV) — Dates Administered (up to 3 doses)", type: "text" },
        { key: "varicella_dates", label: "Varicella (Chickenpox) (Var, MMRV) — Dates Administered (up to 2 doses)", type: "text" },
        { key: "hepa_dates", label: "Hepatitis A (HepA) — Dates Administered (up to 3 doses)", type: "text" },
        { key: "influenza_dates", label: "Influenza (IIV/LAIV) — Dates Administered (up to 4 doses)", type: "text" },
        { key: "meningococcal_dates", label: "Meningococcal (MCV4, MenABCWY) — Dates Administered (up to 3 doses)", type: "text" },
        { key: "meningococcal_b_dates", label: "Meningococcal B (Bexsero, Trumenba, MenABCWY) — Dates Administered (up to 3 doses)", type: "text" },
        { key: "hpv_dates", label: "Human Papillomavirus (HPV) — Dates Administered (up to 3 doses)", type: "text" },
        { key: "additional_vaccines", label: "Additional Vaccines — Type & Date", type: "textarea" },
        {
          key: "immunity_evidence_note",
          type: "note",
          label: "",
          helpText: "Indicate and attach physician diagnosis or laboratory evidence of immunity as applicable.",
        },
        {
          key: "public_act_note",
          type: "note",
          label: "",
          helpText:
            "*Note: According to Public Act 368 of 1978, any child enrolling in a Michigan school for the first time must be adequately immunized, vision tested and hearing tested. Exemptions to these requirements are granted for medical, religious, and other objections, provided that the waiver forms are properly prepared, signed and delivered to school administrators. Forms for these exemptions are available at your provider office for medical waiver forms and through your local health department for nonmedical waiver forms.",
        },
        { key: "chickenpox_history", label: "History of Chickenpox Disease?", type: "select", options: YES_NO, row: "cpx1" },
        { key: "chickenpox_date", label: "If yes, date", type: "date", row: "cpx1" },
        { key: "immunizations_refused", label: "Parent/Guardian refused recommended immunizations at visit", type: "checkbox" },
        {
          key: "immunization_certify",
          label: "I certify that the immunization dates are true to the best of my knowledge",
          type: "checkbox",
          required: true,
        },
        { key: "health_professional_title", label: "Health Professional Title", type: "text" },
      ],
    },
    {
      key: "recommendations",
      label: "Section 5 — Recommendations (Required for Child Care and Head Start/Early Head Start)",
      fields: [
        { key: "vision_hearing_defect", label: "Is there any defect of vision, hearing, or other condition for which the school could help by seating or other actions?", type: "select", options: YES_NO, required: true },
        { key: "vision_hearing_explain", label: "If yes, explain", type: "textarea" },
        { key: "activity_restricted", label: "Should the child's activity be restricted because of any physical defect or illness?", type: "select", options: YES_NO, required: true },
      ],
    },
    {
      key: "activity_restrictions",
      label: "Check All That Apply",
      layout: "grid-2",
      fields: [
        { key: "restrict_classroom", label: "Classroom", type: "checkbox" },
        { key: "restrict_playground", label: "Playground", type: "checkbox" },
        { key: "restrict_gymnasium", label: "Gymnasium", type: "checkbox" },
        { key: "restrict_swimming_pool", label: "Swimming Pool", type: "checkbox" },
        { key: "restrict_competitive_sports", label: "Competitive Sports", type: "checkbox" },
        { key: "restrict_other", label: "Other", type: "checkbox" },
      ],
    },
    {
      key: "recommendations_explain",
      label: "Recommendation Details",
      fields: [
        { key: "restriction_degree_explain", label: "If yes, explain degree of restriction(s)", type: "textarea" },
        { key: "other_recommendations", label: "Other Recommendations", type: "textarea" },
      ],
    },
    {
      key: "dental_exam",
      label: "Section 6 — Dental Exam or Assessment Recommendations",
      fields: [
        { key: "dental_child_name", label: "Child's Name", type: "text", row: "d1" },
        { key: "dental_service_type", label: "Type of Service", type: "select", options: ["Dental Exam", "Dental Assessment"], row: "d1" },
        { key: "dental_findings", label: "Findings", type: "select", options: ["No findings", "Treated Decay", "Untreated Decay"], required: true },
        {
          key: "dental_recommendation",
          label: "Recommendations",
          type: "select",
          options: ["Routine Care", "Referral for dental treatment", "Referral for urgent dental care"],
          required: true,
        },
        { key: "dental_provider_role", label: "Check one", type: "select", options: ["Dentist", "Dental Therapist", "Dental Hygienist"] },
      ],
    },
    {
      key: "physician_signature",
      label: "Section 7 — Physician's Signature",
      fields: [
        { key: "examiner_name", label: "Examiner's Name (Print)", type: "text", required: true, row: "e1" },
        { key: "examiner_degree_license", label: "Degree or License", type: "text", row: "e1" },
        { key: "examiner_phone", label: "Telephone Number", type: "tel", row: "e1" },
        { key: "examiner_address", label: "Address", type: "text", row: "e2" },
        { key: "examiner_city", label: "City", type: "text", row: "e2" },
        { key: "examiner_state", label: "State", type: "text", row: "e2" },
        { key: "examiner_zip", label: "Zip Code", type: "text", row: "e2" },
        {
          key: "info_required_note",
          type: "note",
          label: "Information required for:",
          helpText:
            "Early On — Hearing and Vision Status; Diagnosis; Health status\n" +
            "Child Care Licensing — Physical Exam, Restrictions, Immunizations\n" +
            "Head Start/Early Head Start — Determination that child is up-to-date on a schedule of age-appropriate preventative and primary health care, including medical, dental, and mental health. The schedule must incorporate the well-childcare visit required by EPSDT and the latest immunizations schedule recommended by the Centers for Disease Control and Prevention, State, tribal, and local authorities. An EPSDT well-child exam includes height, weight, and blood tests for anemia at regular intervals based on age.",
        },
        {
          key: "nondiscrimination_note",
          type: "note",
          label: "",
          helpText:
            "The Michigan Department of Health and Human Services (MDHHS) does not discriminate against any individual or group on the basis of race, national origin, color, sex, disability, religion, age, height, weight, familial status, partisan considerations, or genetic information. Sex-based discrimination includes, but is not limited to, discrimination based on sexual orientation, gender identity, gender expression, sex characteristics, and pregnancy.",
        },
      ],
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
      label: "Written Agreement for Parent-Provided Meals",
      fields: [
        {
          key: "meal_agreement_intro",
          type: "note",
          label: "",
          helpText:
            "Although the program at Troy Adventist Academy Preschool includes nutritious vegetarian meals and snacks, some parents may wish to provide food from home for their children. The meal program at our preschool does not include formula or baby food for children too young to eat solid food. Parents of infants, therefore, will wish to provide the formula and food their little one requires.",
        },
        {
          key: "meal_home_instructions",
          type: "note",
          label: "Instructions for Providing Meals from Home",
          helpText:
            "Formula: Please prepare and bottle formula/milk at home so that it is ready for feeding time. Label the bottles with your child's name, date, and any special instructions about heating/storing. Emptied bottles will be returned to you when you pick up your child at the end of the day.\n\n" +
            "Other Food: Please label lunches, snacks, or other foods with your child's name, date, and any special instructions for storage/heating.",
        },
        {
          key: "meal_option",
          label: "Please complete and sign the following agreement",
          type: "select",
          required: true,
          options: [
            "My child is too young to eat the food TAAP provides. I understand that I will need to provide formula/breastmilk and/or infant food until they are ready for the TAAP lunch program.",
            "I may provide some lunches and/or snacks for my child, but I would still like my child to be offered the daily meals/snacks the school provides.",
            "I do not want my child to be served/offered any of the food TAAP provides. I will provide daily meals and snacks for my child.",
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
      key: "packet_checklist",
      label: "Written Information Packet Documentation — Michigan Department of Licensing and Regulatory Affairs, Child Care Licensing Bureau",
      fields: [
        {
          key: "packet_intro",
          type: "note",
          label: "",
          helpText:
            "A written information packet has been provided at the time of enrollment. The packet included all the following information (R 400.8146 (1-2)):",
        },
        {
          key: "packet_items",
          type: "note",
          label: "",
          helpText:
            "• Criteria for admission and withdrawal.\n" +
            "• Schedule of operation, denoting hours, days, and holidays during which the center is open, and services are provided.\n" +
            "• Fee policy.\n" +
            "• Discipline policy.\n" +
            "• Food service program.\n" +
            "• Program philosophy.\n" +
            "• Typical daily routine.\n" +
            "• Parent notification plan for accidents, injuries, incidents, and illnesses.\n" +
            "• Transportation policy, if applicable.\n" +
            "• Medication policy.\n" +
            "• Exclusion policy for child illnesses.",
        },
        {
          key: "licensing_notebook_notice",
          type: "note",
          label: "Notice of the availability of the center's licensing notebook",
          helpText:
            "The center keeps a licensing notebook containing a summary sheet, all licensing inspections and special investigation reports, and related corrective action plans for the last 5 years. The licensing notebook is available to parents/guardians during regular business hours. Reports from at least the past three years are also available at www.michigan.gov/michildcare.",
        },
        { key: "other_notes", label: "Other", type: "text" },
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
          helpText: "Note: a single CCL-4340 form may be used for all children in the same family.",
        },
      ],
    },
  ],
};

const foodAllergyPolicyHtml = `
<h2>Food Allergy Policy</h2>
<p>Troy Adventist Academy Preschool</p>
<p>Food allergies are common in infants and young children. Allergic reactions can range from
mild skin rashes to severe, life-threatening reactions with breathing difficulties. It is
important to reduce the likelihood that such reactions will take place while children are in
our care.</p>
<p>Because not all allergies may be known when a child is enrolled in childcare, the first step
in making TAAP an allergy safe space is to make sure all staff members are trained in recognizing
the symptoms of an allergic reaction and understanding the steps required to provide treatment or
get emergency help when needed. This training is required for all employees at time of hire and
must be completed before unsupervised contact with children is allowed.</p>
<p>The second step is developing specific plans for known allergies. When a child with one or
more allergies is enrolled at TAAP, the following procedures apply:</p>
<ol>
<li>Parents must provide a Food Allergy Care Plan for the child that includes a list of known
allergens, prescribed medications for control and instruction for their administration, and this
child's typical reactions when exposed. <strong>This plan must be signed by both parents and the
child's pediatrician and returned to the school before care can begin and reviewed yearly.</strong></li>
<li>Known allergies will be prominently posted in the classrooms and in the food preparation area.
Individual care plans will be kept in the child's file and also posted where caregivers can refer
to them immediately.</li>
<li>Center families will be notified of known allergies in the center so that they can avoid
bringing these foods into the center. Food sharing between children or children and staff will be
prevented.</li>
<li>If an allergic reaction occurs, caregivers on duty will follow the child's approved care plan.
In the case of a severe reaction, 911 will be notified immediately and epinephrine will be
administered if the child has a prescribed epipen. Parents and the director will also be notified
immediately.</li>
<li>Any time a child is exposed to a known allergen, caregivers must notify parents immediately
and report the incident to the director, even if no reaction appears to occur.</li>
</ol>
`;

const safeSleepPolicyHtml = `
<h2>Troy Adventist Academy Preschool — Safe Sleep Policy</h2>
<ul>
<li>Infants will always be put to sleep on their backs.</li>
<li>Infants will be placed on a firm tightly fitted mattress, with a fitted crib sheet.</li>
<li>No toys, soft objects, stuffed animals, pillows, bumper pads, blankets, positioning devices
or extra bedding will be in the crib or draped over the side of the crib.</li>
<li>Sleeping areas will be kept at a temperature that is comfortable for a lightly clothed
adult.</li>
<li>If additional warmth is needed, a one-piece blanket sleeper or sleep sack will be used
instead of a loose blanket.</li>
<li>The infant's head will remain uncovered for sleep. Bibs and hoods will be removed.</li>
<li>Sleeping infants will be actively observed by sight and sound.</li>
<li>Infants will not be allowed to sleep on a couch, chair cushion, pillow, or in a car seat,
swing, or bouncy chair. If an infant falls asleep anyplace other than his crib, the infant will
be moved to a crib right away.</li>
<li>An infant who arrives asleep in a car seat will be moved to a crib.</li>
<li>Infants will not share cribs, and open sides of cribs will be spaced two feet apart.</li>
<li>Infants may be offered a pacifier for sleep, if provided by the parent.</li>
<li>Pacifiers will not be attached by a string to the infant's clothing and will not be
reinserted if they fall out after the infant is asleep.</li>
<li>When able to roll back and forth from back to front, the infant will be put to sleep on his
back and allowed to assume a preferred sleep position.</li>
<li>In the rare case of a medical condition requiring a sleep position other than on the back,
the parent must provide a signed note from the infant's physician.</li>
<li>TAAP is a smoke-free environment.</li>
<li>TAAP supports breastfeeding.</li>
<li>All infants will have opportunity for adequate tummy time during the day.</li>
<li>Infants and toddlers will not have bottles, beverage containers, or food while in cribs or
other sleeping areas.</li>
</ul>
`;

const medicationPolicyHtml = `
<h2>Medication Policy</h2>
<ul>
<li>Medication, prescription or nonprescription, must be given to a child by a staff member
only.</li>
<li>Medication may be given or applied only with prior written permission from the
parent/guardian.</li>
<li>All medication must be in its original container and clearly labeled with the child's first
and last name.</li>
<li>All medication must have instructions for administration and storage, and these
instructions must be followed unless there are written instructions from a child's physician
authorizing a departure from the instructions on the container.</li>
<li>Prescription medication must have a pharmacy label with the child's first and last name,
instructions, name and strength of the medication, and must be given according to those
instructions.</li>
<li>Medication will be kept out of the reach of children.</li>
<li>Unused medication will be returned to the child's parent.</li>
<li>Medication will not be added to bottles, beverages, or foods unless indicated on the
prescription label or authorized by a physician in writing.</li>
</ul>
`;

const generalInfoHtml = `
<h2>Parent Handbook — General Information</h2>

<h3>Section 1: General Information</h3>
<p>The teachers and staff of Troy Adventist Academy (TAAP) welcome you and your child. As a
parent, your input is important in helping us make the days your child spends with us safe and
happy. Please read the Parent Handbook carefully and keep it for your reference. Feel free to
visit and become an active part of our preschool at any time.</p>
<p><strong>Our Philosophy:</strong> Troy Adventist Academy Preschool (TAAP) has been founded to
minister to the needs of families in our community. We believe that every child is a precious
gift from God, and it is our desire to provide a place where children are cherished and their
families feel respected and welcomed every day.</p>
<p><strong>General Information:</strong> TAAP is licensed by the Michigan Department of
Licensing and Regulatory Affairs (LARA). A copy of our current license is posted in a prominent
location at our school. Our licensed capacity is 98. To be licensed, our preschool must comply
with official licensing regulations. We have on the premises a copy of the governing statutes
and rules, which is available to interested parents for review. Our Licensing Notebook, which
contains all the licensing inspection and special investigation reports and related corrective
action plans for the last five years, is made available during regular business hours. Licensing
inspection and special investigation reports from at least the past three years are available on
the child care licensing website at
<a href="https://www.michigan.gov/michildcare">www.michigan.gov/michildcare</a>. Should you have
any concerns or questions, you may call the toll free number listed on the license.</p>
<p>TAAP's general hours of operation are 7:00 am to 6:00 pm*, Monday through Friday. We operate
four classrooms:</p>
<ul>
<li>Infant/Young Toddlers – Ages 6 weeks to 30 months</li>
<li>Toddlers – 2 year olds</li>
<li>Preschool – 3-4 year olds</li>
<li>PreKindergarten Room – 4-5 year olds</li>
</ul>
<p>We accept children for enrollment on a first-come-first-served basis without regard to race,
religion, nationality, or gender.</p>
<p><em>*In honor of the Biblical Sabbath, which is observed from sundown Friday until sundown
Saturday, TAAP closes early on some Fridays during the late fall and the winter. Please refer to
the yearly calendar for specific dates for these closings, as well as closings for specific
holidays.</em></p>

<h3>Section 2: My Child's Daily Activities</h3>
<p><strong>Our Caring Staff:</strong> At TAAP, we do our best to choose staff members who are
qualified and well trained. We look for people who want the very best for your child and are
willing to go the extra mile to provide a loving and nurturing environment every day. All staff
members must provide evidence of good health and submit both a criminal background check with
fingerprinting and a child abuse/neglect background check from the Department of Human Services
with no negative findings. They complete a minimum of sixteen hours of training each year in
areas relevant to child care and development. Volunteers (including students completing
requirements for classes, or parents of children in care) must be cleared with the office, and
are never left with children unsupervised unless they have completed all background check and
training requirements.</p>
<p><strong>Playtime and Learning Time:</strong> For children, playtime is learning time. At
TAAP, we provide plenty of time each day for free play and exploration. As children grow, we
provide developmentally appropriate activities designed to invite children to learn and explore.
These include small and large group activities, learning centers, sensory and dramatic play, art
and music experiences, and opportunities to participate in early math, science, and literacy
experiences. We try to provide a balance of active and quiet activities and both staff initiated
and child initiated experiences. We want your child to develop in all areas: physical, social,
emotional, and cognitive. We plan our curriculum to combine the best of various styles of
teaching and learning in an effort to provide a climate in which all children may thrive.</p>
<p><strong>Outdoor Play:</strong> Although we have a large indoor play area which we use for
special fitness activities and on days when it is very hot, cold, or wet, we endeavor to take
all the children outside whenever the weather permits. Children in attendance must have proper
clothing for outdoor conditions, including coats, hats, mittens, boots, and snow pants as
needed.</p>
<p><strong>Rest Time:</strong> There is a quiet time for rest each afternoon following lunch. The
room lights are dimmed and quiet music plays. Staff members help each child settle and relax so
they can get the rest they need.</p>
<p><strong>Snack and Meal Time:</strong> At TAAP, nutritious vegetarian meals and snacks are
included in the program. Staff supervision during the serving of lunch and snack promotes a
pleasant and relaxed atmosphere. We do our best to serve food the children will enjoy and
encourage them to eat well, but food is never forced on a child. Monthly menus are posted and
available for parents to take home for reference. Children who are here for a full day will also
receive a morning and afternoon snack. Please do not send candy or gum to the school. Special
treats may be sent for birthdays and holidays; however, please make arrangements with the staff
before sending any food items to the school. Please note that some classrooms are nut free
environments. Please let us know if you need gluten free or dairy free options, as these are
available upon request.</p>
<p>The meal program at TAAP does not include formula or baby food for children too young to eat
solid food. Parents of infants, therefore, will wish to provide the formula and food their
little one requires. Some parents of older children may also wish to provide food from home for
their children. If you would like to do this, please refer to the "Written Agreement for Parent
Provided Meals" which is included with your enrollment packet.</p>
<p><em>Note: Children in the infant area both eat and sleep on demand. Until they are ready to
fit in to a classroom schedule, their daily schedule is personalized to meet their needs.</em></p>
<p><strong>Discipline and Classroom Management:</strong> TAAP maintains a positive approach as a
method of guidance and discipline. Early childhood is a time of rapid growth and transition, and
children experience big emotions that challenge their ability to control or express them. It is
our job as caregivers to make "being good" as easy as possible for them as they grow into their
own personalities. Discipline guidelines are as follows: all methods will be positive and
consistent with the developmental needs of the child. Desirable behavior will be actively
promoted, talked about, encouraged, and praised. (Desirable behaviors include listening and
following directions, being kind to others, and staying safe.) The staff will be present and
attentive to children, redirecting when necessary with a touch or an encouraging word, and
offering them the opportunity to make good choices throughout the day. When intervention is
required, children may be seated away from the group until they can settle down and make a
better choice.</p>
<p><strong>These types of discipline will never be acceptable:</strong> hitting, pushing,
jerking, threatening or frightening, isolating, ridicule, humiliation, or the withholding of
kindness, love, food, or rest. Children who persist to engage in uncontrollable behavior that
becomes disruptive or harmful to themselves or others will not be allowed to continue at TAAP.</p>

<h3>Section 3: What Will I Need to Provide for My Child?</h3>
<p><strong>Application and Records:</strong> After you have visited our facility and decided
that it is the right place for your child, your next step will be completing the forms in the
enrollment packet and providing the records required by the state and by our center. Please
refer to the checklist included with your enrollment packet for the complete list of
requirements and a schedule for maintaining up to date information and medical records. Your
child's file is confidential and will be shared with other staff members only as required to
meet the needs of the child.</p>
<p><strong>Everyday Needs:</strong> These are the items your child will need each day:</p>
<ul>
<li>A small pillow and blanket/sheet for nap time, or a crib sheet for infants.</li>
<li>A complete change of seasonally appropriate clothing that fits your child.</li>
<li>A stuffed animal to cuddle with at nap time is optional.</li>
<li>Diapers and wipes for children who are not toilet trained.</li>
<li>Formula/food for infants or children who will not be eating the meals the center
provides.</li>
</ul>
<p>All articles of clothing, including outerwear, boots, blankets, etc. must be clearly labeled
with your child's full name. Your child's clothing is changed when wet or soiled as needed. Your
child should be dressed in clothing appropriate for active play, ease in using the restroom, and
for daily outdoor activities. We recommend sneakers or rubber-soled gym shoes for safe play.</p>
<p>If you send food, it must be clearly labeled with your child's full name and the date it is
provided.</p>
<p>It is best if your child's personal toys and books are left at home. TAAP staff cannot be
responsible for loss or damage to personal items.</p>

<h3>Section 4: Parental Rights and Responsibilities</h3>
<p><strong>Parent Access:</strong> Parents of enrolled children are always welcome here and are
permitted free access, without prior notice, throughout the building whenever their children are
in our care. If you would like to volunteer or participate in the activities or operations of
the school, please feel free to discuss your interest with the director.</p>
<p>Visitors (other than parents) are allowed in child care areas only at the discretion of the
program director and will be accompanied by a staff member at all times.</p>
<p>In cases where Family Court or other legal entities have established visitation or custody
rights, a copy of the orders must be provided to TAAP. The court orders will be strictly followed
unless the custodial parent requests a more liberal variation of the court order in writing.</p>
<p><strong>Arrival and Departure:</strong> You (as parent/legal guardian) or an authorized adult
must accompany your child into the school and place him/her under staff supervision before
leaving the premises. For the protection of all the children, TAAP maintains a strict release
policy. Our enrollment form provides space to list names of individuals (other than parents) to
whom the child may be released. We also require advance notice in writing or by phone call if
someone other than yourself will be picking up your child. TAAP will not release any child to
someone other than the parent/legal guardian without advance notice. A picture identification may
be required at the time of pick up. If your child has recently been enrolled at our center and
the caregiver on duty does not feel confident that she knows you, she may ask you for
identification as well — please do not be offended by this. When it comes to the safety of your
child, it is better to be completely safe rather than completely sorry!</p>
<p>It is also your responsibility to be timely in your arrival and departure each day. There is
a $1 per MINUTE per family charge for care after closing time. This money should be paid
directly to the staff member who is caring for your child. Please notify us if an emergency
prevents your timely arrival.</p>
<p>At the end of each day, please check your child's cubby for notices, artwork, or special
projects.</p>
<p><strong>Scheduling Changes:</strong> To maintain our quality program and to satisfy licensing
regulations, we schedule adequate staff to care for the number of children enrolled. TAAP is not
responsible to reduce or refund tuition for daily absences due to weather, holidays, illness, or
vacation. Our policy does not require us to provide "make-up" days. We appreciate it if you call
to inform us that your child cannot attend on any given day due to unexpected illnesses or
events.</p>
<p>If your child will be away on an extended leave, or if you are planning to withdraw them from
enrollment at TAAP, please inform the director in writing at least two weeks in advance.</p>
<p>You may wish to request other schedule changes as well, and we will do our best to accommodate
them. Again, please make your request in writing. We cannot guarantee to hold your place for
extended periods (especially if you have not communicated your plans to us) or to allow changes
if our attendance patterns and staffing cannot accommodate them.</p>
<p><strong>Parental Financial Obligations:</strong> Our year at TAAP is divided into four
sessions (fall, winter, spring, and summer) with twelve weeks in each session. There are three
equal payments in each session, with a total of twelve per year. These payments are due during
the first week of each month/session. Please see the payment schedule included with your
enrollment packet for details on various attendance options and additional fees such as
registration, curriculum fees, and the summer activity fee.</p>
<p>Once you have chosen a schedule for your child's attendance, you are responsible to pay
his/her charges each month/session regardless of the number of days he/she actually attends. We
schedule our staff based on the number of children registered to attend each day. We expect them
to be faithful in their commitment to arrive on time each day and take good care of your child.
And we expect you, as parents, to be faithful in fulfilling your financial obligations so that
we can fairly pay them for that faithful service to your child. Please remember that payment is
due regardless of days missed due to illness, holidays, or other school closing.</p>
<p><strong>Holidays:</strong> TAAP is closed for the following holidays: Good Friday and the
Monday following Easter Sunday, Memorial Day, Independence Day, Labor Day, Thanksgiving Day and
the Friday after Thanksgiving, Christmas and New Year's Days and the week between them.</p>
<p><strong>Please Note:</strong> TAAP reserves the right to withdraw a child who has
developmental, behavioral, health, or discipline problems which cause him/her to harm other
children or disrupt the program. At any time during a child's enrollment, TAAP has the right to
withdraw a family for the best interest of the school. Habitual absenteeism or failure to pay
fees will also result in termination of enrollment.</p>

<h3>Section 5: Health and Safety</h3>
<p><strong>Sick Child Policy:</strong> It is TAAP's policy to temporarily exclude children from
care who may be infectious or who demonstrate physical symptoms that require continual one-on-one
care. Deciding when a child is infectious is sometimes a matter of opinion; however, the
guidelines we have established are in compliance with licensing regulations. We will use these
guidelines even if they differ from the opinion of your pediatrician. Although we are sensitive
to the fact that as a working parent you have responsibilities at work, we must make safeguarding
the health of all the children at the school our first priority. The environment we provide is
intimate, and in spite of all the health procedures we employ, the most effective means of
minimizing the spread of infection is to exclude children who may be infectious.</p>
<p><em>The director has the final decision on the exclusion of children.</em></p>
<p><strong>Guidelines for Excluding Children:</strong> If your child has any of the following
conditions he/she should remain home from school until he/she is free of symptoms without the
influence of medication for at least 24 hours or until you have a doctor's note that says he/she
may return:</p>
<ul>
<li>A fever over 100 degrees or Vomiting and/or Diarrhea</li>
<li>Eye discharge or red, itchy, watery eyes, unidentified rashes, excessive coughing, sore
throat, excessive nasal discharge</li>
<li>Other: severe pain or discomfort, jaundice, difficulty breathing, swollen joints or lymph
nodes, blood/pus from ears or skin, urine, or stool, symptoms of impetigo, lice, scabies, or
strep throat.</li>
</ul>
<p>Please refer to the contagious disease chart posted on the board near the office for
additional information.</p>
<p><em>Please Note: These same guidelines apply to the exclusion and return of staff members and
volunteers due to illness.</em></p>
<p><strong>Communicable Diseases:</strong> We will adhere to Michigan Child Care licensing
standards on communicable disease and exclusion times. In cases of certain communicable disease,
TAAP is required to file a report with the Department of Health within 24 hours so that control
measures can be used. We ask the parents/guardians and staff members to notify TAAP within 24
hours if a child or family member has developed a known or suspected communicable disease. If a
child has not been fully vaccinated for some of these diseases, he/she may be excluded from
school during an outbreak of a "vaccine-preventable" illness as directed by the State Health
Department. All parents will be informed in writing if a communicable disease is reported.
Examples of reportable diseases include, but are not limited to: Measles, German Measles, Lyme
Disease, Whooping Cough, Tuberculosis, Salmonella, Rubella, Giardiasis, Spinal Meningitis, Mumps,
Hepatitis A, and Shigella (the communicable disease chart is located on the bulletin board near
the office). If your child contracts a communicable illness, please notify TAAP immediately. We
must post (both on the bulletin board and by email) any incidents of contagious illness to alert
other parents. Upon the return of a child absent due to a contagious illness, a signed statement
from a licensed physician stating that they are no longer contagious must be presented.</p>
<p><strong>Accident, Incident, or Injury:</strong> While in the care of TAAP, no child will be
left without adult supervision, regardless of whether the children are sleeping, playing, eating,
or otherwise engaged. This is the most important rule of all playground and classroom
supervision. Supervision specifically encompasses, but is not limited to, the following times and
areas: arrival, departure, school activities, free choice activities, rest time, eating time,
bathroom visits, walking in the hallways, playing on the playground, or any time the child is in
the care of our staff and their parent/guardian is not present.</p>
<p>In spite of the care and vigilance our staff exercises during the day, it is possible for
accidents, incidents, or injuries to occur. In the case of a minor injury or an incident, we will
provide first aid if needed and call the parent to inform him/her of the situation.</p>
<p>In the case of serious injuries, our first call will be to 911 and our second call to the
parents. First aid will be administered and someone will remain with the child until a
parent/guardian arrives.</p>

<h3>Section 6: Other Information</h3>
<p><strong>Transportation and Field Trips:</strong> Troy Adventist Academy Preschool does not
provide transportation to and from the school. Should there ever be an occasion when a
teacher/caregiver transports a child in his/her vehicle without the parent present, a permission
slip signed by parents/guardian will be required. A copy of this slip will be kept in the child's
file at the center.</p>
<p><strong>Calendars and Schedules:</strong> You will notice that your enrollment packet includes
a sample schedule. You will find more specific schedules posted outside each classroom as well,
along with the lesson plan/activity schedule for each week. Monthly calendars with upcoming
events and lunch and snack menus will be available on the parent table near the office. Each
September, a calendar of events for the year will be available, which will include
holidays/vacations, and early Friday closings along with other pertinent information.</p>
<p><strong>Emergency Procedures:</strong> Our caregivers are required to maintain current
certificates in First Aid and CPR. There is always a caregiver in the building with this
training. All staff members are trained in blood borne pathogens procedures before they are
allowed unsupervised contact with children.</p>
<p>In addition to this, emergency drills will be conducted on a regular basis, and staff are
trained in these procedures at the time of employment and twice a year thereafter. Detailed
emergency plans are posted in each classroom. The alternate safe location is not specified on
this page for safety reasons — when your child is enrolled, you will be provided with the address
and phone number of this location, as well as the entry code for the front door.</p>
<p><strong>Notifying Parents:</strong> While your child is in our care, we will notify you any
time we notice changes in their health or behavior that concern us. In the case of accident,
illness, injury, or any other emergencies, notifying you will be one of our very first
priorities. Your contact information is always accessible in every classroom and in the office.
Please make sure you keep it current! We will try to reach you by phone or by text, and will
contact other names you have provided if you cannot be reached.</p>
<p>In general, TAAP will be closed on the following holidays: New Year's Day, Good Friday and
the Monday following Easter Sunday, Memorial Day, Independence Day (July 4), Labor Day,
Thanksgiving Day and the Friday that follows it, and one week during the Christmas holidays. In
addition, TAAP is closed for two staff training/preparation days — one in the spring and one in
the fall. Please remember that regular payments are due even during months that include
holidays.</p>
<p>We use an online system called HiMama to keep track of attendance and send daily reports. We
also communicate with you via text or email using this system. Please be sure that you have
provided accurate email addresses and cell phone numbers to make this possible.</p>
<p><strong>Bad Weather Conditions:</strong> TAAP will do its best to remain open regardless of
weather conditions. In the event of weather conditions severe enough to require closing the
preschool, you will be notified by text or email by 6:30am.</p>
<p><strong>Agreement:</strong> Troy Adventist Academy Preschool has outlined its duties and
responsibilities, as well as your obligations as parents of an enrolled child. These policies
have been carefully explained in order to ensure the comfort and protection of your child. We
will do our best to provide your child with a program to suit his/her needs, and an environment
in which he/she can feel both secure and free to grow.</p>
<p>As a parent of a child who is enrolled at TAAP, I agree to abide by and adhere to all
policies set forth in this handbook. The binding signature itself is captured on the enrollment
application, not on this reference page.</p>
`;

const dailyScheduleHtml = `
<h2>Sample Daily Schedules</h2>
<p><em>Room 1 schedule is based on children's needs (infants eat and sleep on demand).</em></p>

<h3>Room 2</h3>
<table>
<thead><tr><th>Time</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr></thead>
<tbody>
<tr><td>7:00–8:30</td><td colspan="5">Welcoming Children / Free Play</td></tr>
<tr><td>8:30–9:30</td><td colspan="5">Breakfast</td></tr>
<tr><td>9:30–10:00</td><td>Welcome and Free Play</td><td>Free Play</td><td>Free Play</td><td>Free Play</td><td>Free Play</td></tr>
<tr><td>10:00–10:15</td><td colspan="5">Circle Time</td></tr>
<tr><td>10:15–11:15</td><td colspan="5">Learning/Exploration Time</td></tr>
<tr><td>11:15–12:00</td><td colspan="5">Active Play</td></tr>
<tr><td>12:00–1:00</td><td colspan="5">Lunch</td></tr>
<tr><td>1:00–3:00</td><td colspan="5">Nap/Rest</td></tr>
<tr><td>3:00–3:45</td><td colspan="5">Snack</td></tr>
<tr><td>3:45–6:00</td><td colspan="5">Play Time / Active Play</td></tr>
</tbody>
</table>

<h3>Rooms 3/4</h3>
<table>
<thead><tr><th>Time</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr></thead>
<tbody>
<tr><td>7:00–8:00</td><td colspan="5">Free Play</td></tr>
<tr><td>8:00–9:30</td><td colspan="5">Breakfast</td></tr>
<tr><td>9:30–10:00</td><td colspan="5">Active Play</td></tr>
<tr><td>10:00–11:00</td><td>Learning Time, Teacher Directed Small Group Learning</td><td>Learning Time, Teacher Directed Small Group Learning</td><td>Learning Time, Teacher Directed Small Group Learning</td><td>Learning Time, Teacher Directed Learning (Music Day)</td><td>Free Play Day</td></tr>
<tr><td>10:30–11:30</td><td colspan="5">Exploration Time, Child Directed Learning Time</td></tr>
<tr><td>11:30–1:00</td><td>Lunch &amp; Active Play</td><td>Lunch &amp; Play</td><td>Lunch &amp; Play</td><td>Lunch &amp; Play</td><td>Lunch &amp; Play</td></tr>
<tr><td>1:00–3:00</td><td colspan="5">Nap/Rest</td></tr>
<tr><td>3:00–3:45</td><td colspan="5">Snack</td></tr>
<tr><td>3:45–6:00</td><td colspan="5">Play Time / Active Play</td></tr>
</tbody>
</table>
`;

const paymentCalendarHtml = `
<h2>2025–2026 Payment Schedule</h2>
<table>
<thead><tr><th>Month</th><th>Week 1</th><th>Week 2</th><th>Week 3</th><th>Week 4</th><th>Week 5</th></tr></thead>
<tbody>
<tr><td colspan="6"><strong>Fall Session</strong></td></tr>
<tr><td>September</td><td>9/1</td><td>9/8</td><td>9/15</td><td>9/22</td><td></td></tr>
<tr><td>October</td><td>9/29</td><td>10/6</td><td>10/13</td><td>10/20</td><td>10/27 – Free Week</td></tr>
<tr><td>November</td><td>11/3</td><td>11/10</td><td>11/17</td><td>11/24</td><td></td></tr>
<tr><td colspan="6"><strong>Winter Session</strong></td></tr>
<tr><td>December</td><td>12/1</td><td>12/8</td><td>12/15</td><td>12/22 – Christmas Vacation</td><td>12/29 – Free Week</td></tr>
<tr><td>January</td><td>1/5</td><td>1/12</td><td>1/19</td><td>1/26</td><td></td></tr>
<tr><td>February</td><td>2/2</td><td>2/9</td><td>2/16</td><td>2/23</td><td></td></tr>
<tr><td colspan="6"><strong>Spring Session</strong></td></tr>
<tr><td>March</td><td>3/2</td><td>3/9</td><td>3/16</td><td>3/23</td><td></td></tr>
<tr><td>April</td><td>3/30</td><td>4/6</td><td>4/13</td><td>4/20</td><td>4/27 – Free Week</td></tr>
<tr><td>May</td><td>5/4</td><td>5/11</td><td>5/18</td><td>5/25</td><td>6/1 – Free Week for full year students</td></tr>
<tr><td colspan="6"><strong>Summer Session</strong></td></tr>
<tr><td>June</td><td>6/8</td><td>6/15</td><td>6/22</td><td>6/29</td><td></td></tr>
<tr><td>July</td><td>7/6</td><td>7/13</td><td>7/20</td><td>7/27</td><td></td></tr>
<tr><td>August</td><td>8/3</td><td>8/10</td><td>8/18</td><td>8/25</td><td></td></tr>
</tbody>
</table>
<blockquote>
<p>"There are no refunds for sick days, vacations, or holidays. Schedule changes may be made at
the beginning of each month. Special circumstances may be discussed with the director/treasurer.
Tuition rates are based on four 12-week sessions, with three equal payments in each session. The
monthly payment covers a 4-week segment of the session." (taken from the 2025-26 Schedule and
Financial Agreement)</p>
</blockquote>
<p>Please note that everyone who is here year round pays for 48 weeks (4x12), but has access to
care for 52 weeks (see 4 free weeks). This assumes that you will take vacations through the year
according to your family's schedule. If you take an extended leave (more than 4 weeks) you may
discuss this with the director to make special arrangements for charges during your absence.</p>
`;

const lunchMenuHtml = `
<h2>TAAP — August Lunch Menu 2026</h2>
<table>
<thead><tr><th>Week</th><th>Date</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr></thead>
<tbody>
<tr>
<td>1</td><td>8/3</td>
<td>Spaghetti, Garlic Bread, Broccoli</td>
<td>Seasoned Rice &amp; Egg Rolls/Samosas, Raita, Cottage Cheese</td>
<td>Buttered Noodles, Oatmeal Patties, Mandarin Oranges</td>
<td>Waffles, Applesauce, Breakfast Links/Veggie Nuggets, Tater Tots</td>
<td>Personal Pizzas, Fruit/Salad, Dessert</td>
</tr>
<tr>
<td>2</td><td>8/10</td>
<td>Black Bean Soup, Chips, Quesadilla/Baked Potato</td>
<td>Rice &amp; Dal, Bread, Cookie</td>
<td>Macaroni &amp; Cheese, Veggie Nuggets, Fresh Veggies/Fruit</td>
<td>Pasta, Veggies, Bread Sticks</td>
<td>Personal Pizzas, Fruit/Salad, Dessert</td>
</tr>
<tr>
<td>3</td><td>8/17</td>
<td>Spaghetti, Garlic Bread, Broccoli</td>
<td>Seasoned Rice &amp; Samosas/Egg Rolls, Raita, Cottage Cheese</td>
<td>Buttered Noodles, Oatmeal Patties, Mandarin Oranges</td>
<td>Paneer in Sauce with Rice, Green Beans</td>
<td>Personal Pizzas, Fruit/Salad, Dessert</td>
</tr>
<tr>
<td>4</td><td>8/24</td>
<td>Rice &amp; Beans, Bread, Broccoli</td>
<td>Macaroni &amp; Cheese, Veggie Nuggets, Fresh Veggies/Fruit</td>
<td>Rice &amp; Dal, Bread, Cookie</td>
<td>Tomato Soup, Quesadilla/Bread &amp; Spread/Veggies, Soup Crackers</td>
<td>Personal Pizzas, Fruit/Salad, Dessert</td>
</tr>
<tr>
<td>5</td><td>8/31</td>
<td>Spaghetti, Garlic Bread, Broccoli</td>
<td>Seasoned Rice &amp; Cheese, Veggie Nuggets, Fresh Veggies/Fruit</td>
<td>Buttered Noodles, Oatmeal Patties, Mandarin Oranges</td>
<td>Waffles, Applesauce, Breakfast Links/Veggie Nuggets, Tater Tots</td>
<td>Closed for Fall Prep Day</td>
</tr>
</tbody>
</table>

<h3>Weekly Snack Rotation</h3>
<table>
<thead><tr><th>Week</th><th>Morning Snack</th><th>Afternoon Snack</th></tr></thead>
<tbody>
<tr><td>1</td><td>Cheerios with Milk &amp; Fruit</td><td>Crackers &amp; Cheese</td></tr>
<tr><td>2</td><td>Waffles, Applesauce, Milk</td><td>Goldfish Crackers &amp; Yogurt</td></tr>
<tr><td>3</td><td>Cheerios with Milk &amp; Fruit</td><td>Cookies &amp; Fruit</td></tr>
<tr><td>4</td><td>Muffins &amp; Milk</td><td>Veggie Sticks &amp; Apple Juice</td></tr>
<tr><td>5</td><td>Cheerios with Milk &amp; Fruit</td><td>Cookies &amp; Fruit</td></tr>
</tbody>
</table>
`;

// Real 2025/26 monthly tuition rates from Troy Adventist Academy Preschool.pdf
// p.3 — the single source of truth for both the reference page below and the
// RateCard rows the Schedule and Financial Agreement form looks up against.
// Rates are indexed [5 days, 4 days, 3 days, 2 days] per week, matching the
// scheduleAgreement form's `days_per_week` options in that same order.
const SCHOOL_YEAR = "2025-26";
const TUITION_RATES: { scheduleType: string; rooms: { room: string; rates: number[] }[] }[] = [
  {
    scheduleType: "Full Day (7am-6pm)",
    rooms: [
      { room: "Room 1 (0-24mos)", rates: [1730, 1620, 1380, 980] },
      { room: "Room 2 (24-36mos)", rates: [1620, 1500, 1270, 925] },
      { room: "Preschool (3-4yrs)", rates: [1500, 1380, 1155, 865] },
      { room: "PreK (4-5yrs)", rates: [1380, 1270, 1095, 810] },
    ],
  },
  {
    scheduleType: "Half Day (7-1 or 12-6)",
    rooms: [
      { room: "Room 1 (0-24mos)", rates: [1220, 1095, 980, 690] },
      { room: "Room 2 (24-36mos)", rates: [1105, 1040, 925, 635] },
      { room: "Preschool (3-4yrs)", rates: [1065, 980, 865, 600] },
      { room: "PreK (4-5yrs)", rates: [980, 865, 780, 550] },
    ],
  },
  {
    // Not available in Room 1, per the handbook — same rate for every other room.
    scheduleType: "Activity Time (9:30-1, not Room 1)",
    rooms: [
      { room: "Room 2 (24-36mos)", rates: [925, 865, 730, 525] },
      { room: "Preschool (3-4yrs)", rates: [925, 865, 730, 525] },
      { room: "PreK (4-5yrs)", rates: [925, 865, 730, 525] },
    ],
  },
  {
    scheduleType: "School Day (9:30am-3:30pm)",
    rooms: [
      { room: "Room 1 (0-24mos)", rates: [1470, 1360, 1180, 840] },
      { room: "Room 2 (24-36mos)", rates: [1380, 1270, 1095, 780] },
      { room: "Preschool (3-4yrs)", rates: [1300, 1185, 1015, 720] },
      { room: "PreK (4-5yrs)", rates: [1185, 1070, 925, 660] },
    ],
  },
];
const DAYS_PER_WEEK = [5, 4, 3, 2];

const DROP_IN_RATES = [
  { room: "Room 1", full: 85, half: 60 },
  { room: "Room 2", full: 80, half: 55 },
  { room: "Preschool", full: 75, half: 50 },
  { room: "PreK", full: 70, half: 45 },
];

function ratesTableHtml(scheduleType: string, rooms: { room: string; rates: number[] }[]): string {
  const rows = rooms
    .map(
      (r) =>
        `<tr><td>${r.room}</td>${r.rates.map((rate) => `<td>$${rate}/mo</td>`).join("")}</tr>`
    )
    .join("\n");
  return `
<h3>${scheduleType}</h3>
<table>
<thead><tr><th></th><th>5 days/wk</th><th>4 days/wk</th><th>3 days/wk</th><th>2 days/wk</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
`;
}

const scheduleFinancialAgreementHtml = `
<h2>Schedule and Financial Agreement — ${SCHOOL_YEAR} School Year</h2>

<h3>Other Charges</h3>
<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr><td>Registration for New Students (non refundable)</td><td>$100</td></tr>
<tr><td>Curriculum Fee (September–May) (non refundable)</td><td>$200</td></tr>
<tr><td>Summer Activity Fee (June–August) (non refundable)</td><td>$150</td></tr>
<tr><td>Late arrival charge (past 6pm), paid immediately to the caregiver on duty</td><td>$1.00/minute</td></tr>
</tbody>
</table>
<p>Make checks payable to TAAP and write your child's full name in the memo line on the check.
Returned checks may be subject to a $30 NSF fee. There are no refunds for sick days, vacations,
or holidays. Schedule changes may be made at the beginning of each month. Special circumstances
may be discussed with the director/treasurer.</p>
<p>Tuition rates are based on four 12-week sessions, with three equal payments in each session.
The monthly payment covers a 4-week segment of the session.</p>

<h3>Monthly Tuition Rates</h3>
${TUITION_RATES.map((r) => ratesTableHtml(r.scheduleType, r.rooms)).join("\n")}

<h3>Drop In Days</h3>
<table>
<thead><tr><th></th><th>Full</th><th>Half</th></tr></thead>
<tbody>
${DROP_IN_RATES.map((d) => `<tr><td>${d.room}</td><td>$${d.full}</td><td>$${d.half}</td></tr>`).join("\n")}
</tbody>
</table>
`;

async function main() {
  // Orphaned by the Food Allergy Policy's move from a FormTemplate to a PolicyPage below.
  await prisma.formTemplate.deleteMany({ where: { id: "seed-food-allergy-policy-form" } });

  // From Troy Adventist.pdf, pages 3-7. Sorts first in the Forms nav.
  await prisma.formTemplate.upsert({
    where: { id: "seed-getting-to-know-your-child" },
    update: { schemaJson: asJson(gettingToKnowYourChild), isActive: true, sortOrder: 0, category: "FORMS" },
    create: {
      id: "seed-getting-to-know-your-child",
      name: gettingToKnowYourChild.name,
      schemaJson: asJson(gettingToKnowYourChild),
      sortOrder: 0,
      category: "FORMS",
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-schedule-agreement" },
    update: { schemaJson: asJson(scheduleAgreement), isActive: true, sortOrder: 1, category: "PARENT_CONSENT" },
    create: {
      id: "seed-schedule-agreement",
      name: scheduleAgreement.name,
      schemaJson: asJson(scheduleAgreement),
      sortOrder: 1,
      category: "PARENT_CONSENT",
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-child-info-record" },
    update: { schemaJson: asJson(childInformationRecord), isActive: true, sortOrder: 2, category: "FORMS" },
    create: {
      id: "seed-child-info-record",
      name: childInformationRecord.name,
      schemaJson: asJson(childInformationRecord),
      sortOrder: 2,
      category: "FORMS",
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-health-appraisal" },
    update: { schemaJson: asJson(healthAppraisal), isActive: true, sortOrder: 3, category: "FORMS" },
    create: {
      id: "seed-health-appraisal",
      name: healthAppraisal.name,
      schemaJson: asJson(healthAppraisal),
      sortOrder: 3,
      category: "FORMS",
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-photo-use-permission" },
    update: { schemaJson: asJson(photoUsePermission), isActive: true, sortOrder: 4, category: "PARENT_CONSENT" },
    create: {
      id: "seed-photo-use-permission",
      name: photoUsePermission.name,
      schemaJson: asJson(photoUsePermission),
      sortOrder: 4,
      category: "PARENT_CONSENT",
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-application-agreement" },
    update: { schemaJson: asJson(applicationAgreement), isActive: true, sortOrder: 5, category: "PARENT_CONSENT" },
    create: {
      id: "seed-application-agreement",
      name: applicationAgreement.name,
      schemaJson: asJson(applicationAgreement),
      sortOrder: 5,
      category: "PARENT_CONSENT",
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-meal-agreement" },
    update: { schemaJson: asJson(mealAgreement), isActive: true, sortOrder: 6, category: "PARENT_CONSENT" },
    create: {
      id: "seed-meal-agreement",
      name: mealAgreement.name,
      schemaJson: asJson(mealAgreement),
      sortOrder: 6,
      category: "PARENT_CONSENT",
    },
  });

  await prisma.formTemplate.upsert({
    where: { id: "seed-written-information-packet" },
    update: { schemaJson: asJson(writtenInformationPacket), isActive: true, sortOrder: 7, category: "FORMS" },
    create: {
      id: "seed-written-information-packet",
      name: writtenInformationPacket.name,
      schemaJson: asJson(writtenInformationPacket),
      sortOrder: 7,
      category: "FORMS",
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-food-allergy-policy" },
    update: { contentHtml: foodAllergyPolicyHtml, requiresAcknowledgment: true, sortOrder: 0, category: "POLICIES" },
    create: {
      id: "seed-food-allergy-policy",
      title: "Food Allergy Policy",
      contentHtml: foodAllergyPolicyHtml,
      requiresAcknowledgment: true,
      sortOrder: 0,
      category: "POLICIES",
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-safe-sleep-policy" },
    update: { contentHtml: safeSleepPolicyHtml, requiresAcknowledgment: true, sortOrder: 1, category: "POLICIES" },
    create: {
      id: "seed-safe-sleep-policy",
      title: "Safe Sleep Policy",
      contentHtml: safeSleepPolicyHtml,
      requiresAcknowledgment: true,
      sortOrder: 1,
      category: "POLICIES",
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-medication-policy" },
    update: { contentHtml: medicationPolicyHtml, requiresAcknowledgment: true, sortOrder: 2, category: "POLICIES" },
    create: {
      id: "seed-medication-policy",
      title: "Medication Policy",
      contentHtml: medicationPolicyHtml,
      requiresAcknowledgment: true,
      sortOrder: 2,
      category: "POLICIES",
    },
  });

  // Reference-only pages (auto-marked read on view, no explicit checkbox) —
  // grouped under the Information section, per Section 2 of the spec.
  await prisma.policyPage.upsert({
    where: { id: "seed-general-info" },
    update: { contentHtml: generalInfoHtml, requiresAcknowledgment: false, sortOrder: 3, category: "INFORMATION" },
    create: {
      id: "seed-general-info",
      title: "Parent Handbook — General Information",
      contentHtml: generalInfoHtml,
      requiresAcknowledgment: false,
      sortOrder: 3,
      category: "INFORMATION",
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-daily-schedule" },
    update: { contentHtml: dailyScheduleHtml, requiresAcknowledgment: false, sortOrder: 4, category: "INFORMATION" },
    create: {
      id: "seed-daily-schedule",
      title: "Sample Daily Schedule",
      contentHtml: dailyScheduleHtml,
      requiresAcknowledgment: false,
      sortOrder: 4,
      category: "INFORMATION",
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-lunch-menu" },
    update: { contentHtml: lunchMenuHtml, requiresAcknowledgment: false, sortOrder: 6, category: "INFORMATION" },
    create: {
      id: "seed-lunch-menu",
      title: "Lunch Menu",
      contentHtml: lunchMenuHtml,
      requiresAcknowledgment: false,
      sortOrder: 6,
      category: "INFORMATION",
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-payment-calendar" },
    update: { contentHtml: paymentCalendarHtml, requiresAcknowledgment: false, sortOrder: 7, category: "INFORMATION" },
    create: {
      id: "seed-payment-calendar",
      title: "2025–26 Payment & Session Calendar",
      contentHtml: paymentCalendarHtml,
      requiresAcknowledgment: false,
      sortOrder: 7,
      category: "INFORMATION",
    },
  });

  await prisma.policyPage.upsert({
    where: { id: "seed-schedule-financial-agreement-info" },
    update: { contentHtml: scheduleFinancialAgreementHtml, requiresAcknowledgment: false, sortOrder: 8, category: "INFORMATION" },
    create: {
      id: "seed-schedule-financial-agreement-info",
      title: "Schedule and Financial Agreement",
      contentHtml: scheduleFinancialAgreementHtml,
      requiresAcknowledgment: false,
      sortOrder: 8,
      category: "INFORMATION",
    },
  });

  // Real monthly tuition rates, keyed exactly like the scheduleAgreement
  // form's room/schedule_type/days_per_week options so the form can look up
  // and auto-fill the monthly amount as the parent makes selections.
  for (const { scheduleType, rooms } of TUITION_RATES) {
    for (const { room, rates } of rooms) {
      for (let i = 0; i < DAYS_PER_WEEK.length; i++) {
        await prisma.rateCard.upsert({
          where: {
            schoolYear_room_scheduleType_daysPerWeek: {
              schoolYear: SCHOOL_YEAR,
              room,
              scheduleType,
              daysPerWeek: DAYS_PER_WEEK[i],
            },
          },
          update: { monthlyRate: rates[i], isActive: true },
          create: {
            schoolYear: SCHOOL_YEAR,
            room,
            scheduleType,
            daysPerWeek: DAYS_PER_WEEK[i],
            monthlyRate: rates[i],
          },
        });
      }
    }
  }

  // Starter fee catalog for the parent-facing cart (/cart). Monthly tuition
  // itself is intentionally not a FeeItem — it stays RateCard/submission-
  // driven, set up separately from the Schedule and Financial Agreement.
  const FEE_ITEMS: {
    id: string;
    name: string;
    description: string;
    amountCents: number;
    sortOrder: number;
  }[] = [
    {
      id: "seed-fee-registration",
      name: "Registration for New Students",
      description: "Non-refundable.",
      amountCents: 10000,
      sortOrder: 1,
    },
    {
      id: "seed-fee-curriculum",
      name: "Curriculum Fee (September–May)",
      description: "Non-refundable.",
      amountCents: 20000,
      sortOrder: 2,
    },
    {
      id: "seed-fee-summer-activity",
      name: "Summer Activity Fee (June–August)",
      description: "Non-refundable.",
      amountCents: 15000,
      sortOrder: 3,
    },
  ];

  for (const fee of FEE_ITEMS) {
    await prisma.feeItem.upsert({
      where: { id: fee.id },
      update: {
        name: fee.name,
        description: fee.description,
        amountCents: fee.amountCents,
        sortOrder: fee.sortOrder,
      },
      create: {
        id: fee.id,
        name: fee.name,
        description: fee.description,
        amountCents: fee.amountCents,
        type: "ONE_TIME",
        sortOrder: fee.sortOrder,
      },
    });
  }

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
