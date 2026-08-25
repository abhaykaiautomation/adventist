import { z } from "zod";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "select"
  | "checkbox"
  | "number"
  | "email"
  | "tel"
  // Read-only disclosure text (e.g. a licensing-required checklist) — no
  // input, not part of the submitted dataJson or its validation.
  | "note";

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  helpText?: string;
  /** Consecutive fields sharing this key render side by side in one row
   * (e.g. "name_dob", "city_state_zip") instead of one per line. */
  row?: string;
}

export type SectionAudience = "PARENT" | "PHYSICIAN" | "DENTIST";

export interface RepeatableRowField {
  key: string;
  label: string;
  type: FieldType;
}

export interface RepeatableGroup {
  rowFields: RepeatableRowField[];
  /** Rows rendered up front, before any "Add" click. Default 1. */
  minRows?: number;
  maxRows?: number;
  /** Default "+ Add row". */
  addLabel?: string;
}

export interface FormSection {
  key: string;
  label: string;
  fields: FormField[];
  /** Who fills this section in. Defaults to PARENT when omitted (see share-link flow). */
  audience?: SectionAudience;
  /** Rendering layout for this section's fields. Defaults to a single stacked
   * column; "grid-2" arranges them in a two-column grid (e.g. a compact set
   * of related checkboxes). */
  layout?: "list" | "grid-2";
  /** An open-ended list of rows with an "Add row" button — the digital
   * equivalent of the paper form's "attach additional sheets if more are
   * needed" (e.g. emergency contacts). Rendered after `fields` (typically
   * just the section's intro/note text). Stored in dataJson as an array
   * under this section's key, rather than as flat field keys. */
  repeatable?: RepeatableGroup;
}

export interface FormSchema {
  name: string;
  sections: FormSection[];
}

export function allFields(schema: FormSchema): FormField[] {
  return schema.sections.flatMap((s) => s.fields);
}

/** Consecutive fields sharing the same non-empty `row` value are grouped
 * together so a renderer can lay them out side by side (e.g. Name + DOB, or
 * City/State/Zip) instead of one per line. Shared between the fillable
 * FormRenderer and the read-only admin submission view so both render a
 * schema's fields in the same visual grouping. */
export function groupFieldsByRow(fields: FormField[]): FormField[][] {
  const groups: FormField[][] = [];
  let currentRow: string | undefined;
  for (const field of fields) {
    if (field.row && field.row === currentRow) {
      groups[groups.length - 1].push(field);
    } else {
      groups.push([field]);
      currentRow = field.row;
    }
  }
  return groups;
}

/** Sections filled in by a given audience — sections with no `audience` default to PARENT. */
export function sectionsForAudience(schema: FormSchema, audience: SectionAudience): FormSection[] {
  return schema.sections.filter((s) => (s.audience ?? "PARENT") === audience);
}

export function hasExternalSigner(schema: FormSchema): boolean {
  return schema.sections.some((s) => s.audience && s.audience !== "PARENT");
}

/**
 * Builds a Zod object schema from schemaJson for the "Send" validation gate
 * (Section 2), scoped to one audience's sections — a parent's Send only
 * validates PARENT sections; the physician's share-link submit validates
 * their own sections separately (Section 6, share-for-completion flow).
 */
function fieldZodSchema(field: Pick<FormField, "type" | "label" | "required">): z.ZodTypeAny {
  switch (field.type) {
    case "checkbox":
      return field.required
        ? z.literal(true, { message: `${field.label} must be checked` })
        : z.boolean().optional();
    case "number":
      return field.required
        ? z.coerce.number({ message: `${field.label} is required` })
        : z.coerce.number().optional();
    case "email":
      return field.required
        ? z.string().email(`${field.label} must be a valid email`)
        : z.string().email().optional().or(z.literal(""));
    default:
      return field.required
        ? z.string().min(1, `${field.label} is required`)
        : z.string().optional();
  }
}

export function buildZodSchema(schema: FormSchema, audience: SectionAudience = "PARENT") {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const section of sectionsForAudience(schema, audience)) {
    for (const field of section.fields) {
      if (field.type === "note") continue;
      shape[field.key] = fieldZodSchema(field);
    }

    if (section.repeatable) {
      const rowShape: Record<string, z.ZodTypeAny> = {};
      for (const rf of section.repeatable.rowFields) {
        // Row entries are left optional — a parent leaving an unused row
        // blank shouldn't block submission (see RepeatableGroup docs).
        rowShape[rf.key] = fieldZodSchema({ ...rf, required: false });
      }
      shape[section.key] = z.array(z.object(rowShape)).optional();
    }
  }

  return z.object(shape);
}
