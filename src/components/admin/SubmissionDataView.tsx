import type { FormField, FormSchema } from "@/lib/forms/schema";
import { groupFieldsByRow } from "@/lib/forms/schema";

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function FieldValue({ field, value }: { field: FormField; value: unknown }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{field.label}</dt>
      <dd className="text-sm text-gray-800">{formatValue(value)}</dd>
    </div>
  );
}

/** Renders a submission's data using the same section/row/repeatable-group
 * structure as the parent's enrollment form (FormRenderer), just read-only
 * and in the admin's light theme — so an admin reviewing a submission sees
 * the same shape of form the parent filled in, not a flattened, reordered
 * field dump. */
export function SubmissionDataView({
  schema,
  data,
}: {
  schema: FormSchema;
  data: Record<string, unknown>;
}) {
  return (
    <div className="space-y-6">
      {schema.sections.map((section) => {
        const dataFields = section.fields.filter((f) => f.type !== "note");
        const rows = section.repeatable
          ? Array.isArray(data?.[section.key])
            ? (data[section.key] as Record<string, unknown>[])
            : []
          : null;

        if (dataFields.length === 0 && !section.repeatable) return null;

        return (
          <div key={section.key}>
            <h3 className="font-[family-name:var(--font-fraunces)] text-sm font-semibold text-blue-950">
              {section.label}
            </h3>

            {dataFields.length > 0 && (
              <div
                className={`mt-2 gap-3 ${
                  section.layout === "grid-2" ? "grid grid-cols-1 sm:grid-cols-2" : "grid grid-cols-1 sm:grid-cols-2"
                }`}
              >
                {groupFieldsByRow(dataFields).map((group) =>
                  group.length > 1 ? (
                    <div key={group.map((f) => f.key).join("+")} className="flex flex-wrap gap-4 sm:col-span-2">
                      {group.map((field) => (
                        <div key={field.key} className="min-w-[140px] flex-1">
                          <FieldValue field={field} value={data?.[field.key]} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <FieldValue key={group[0].key} field={group[0]} value={data?.[group[0].key]} />
                  )
                )}
              </div>
            )}

            {section.repeatable && (
              <div className="mt-2 space-y-2">
                {rows && rows.length > 0 ? (
                  rows.map((row, i) => (
                    <div key={i} className="rounded border border-gray-200 bg-gray-50 p-2">
                      <p className="mb-1 text-xs font-medium text-gray-500">#{i + 1}</p>
                      <div className="flex flex-wrap gap-4">
                        {section.repeatable!.rowFields.map((rf) => (
                          <div key={rf.key} className="min-w-[120px] flex-1">
                            <dt className="text-xs text-gray-500">{rf.label}</dt>
                            <dd className="text-sm text-gray-800">{formatValue(row?.[rf.key])}</dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">(none provided)</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
