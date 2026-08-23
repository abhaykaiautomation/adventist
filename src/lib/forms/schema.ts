import { z } from "zod";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "select"
  | "checkbox"
  | "number"
  | "email"
  | "tel";

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  helpText?: string;
}

export type SectionAudience = "PARENT" | "PHYSICIAN" | "DENTIST";

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
}

export interface FormSchema {
  name: string;
  sections: FormSection[];
}

export function allFields(schema: FormSchema): FormField[] {
  return schema.sections.flatMap((s) => s.fields);
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
export function buildZodSchema(schema: FormSchema, audience: SectionAudience = "PARENT") {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of allFields({ ...schema, sections: sectionsForAudience(schema, audience) })) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "checkbox":
        fieldSchema = field.required
          ? z.literal(true, { message: `${field.label} must be checked` })
          : z.boolean().optional();
        break;
      case "number":
        fieldSchema = field.required
          ? z.coerce.number({ message: `${field.label} is required` })
          : z.coerce.number().optional();
        break;
      case "email":
        fieldSchema = field.required
          ? z.string().email(`${field.label} must be a valid email`)
          : z.string().email().optional().or(z.literal(""));
        break;
      default:
        fieldSchema = field.required
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
    }

    shape[field.key] = fieldSchema;
  }

  return z.object(shape);
}
