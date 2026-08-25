import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import type { FormSchema } from "@/lib/forms/schema";

export interface PdfSignature {
  signerRole: string;
  signerName: string;
  signatureImg: string; // data URL, e.g. "data:image/png;base64,...."
  signedAt: Date;
}

export type PdfVariant = "blank" | "draft" | "submitted";

const PAGE_SIZE: [number, number] = [612, 792]; // US Letter
const MARGIN = 54;

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export async function generateFormPdf({
  templateName,
  schema,
  dataJson,
  signatures,
  variant,
}: {
  templateName: string;
  schema: FormSchema;
  dataJson: Record<string, unknown> | null;
  signatures: PdfSignature[];
  variant: PdfVariant;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage(PAGE_SIZE);
  let y = PAGE_SIZE[1] - MARGIN;

  function drawWatermark(p: typeof page) {
    if (variant === "draft") {
      p.drawText("DRAFT — NOT YET SUBMITTED", {
        x: 80,
        y: PAGE_SIZE[1] / 2,
        size: 40,
        font: boldFont,
        color: rgb(0.85, 0.2, 0.2),
        opacity: 0.25,
        rotate: degrees(35),
      });
    }
  }

  function newPage() {
    drawWatermark(page);
    page = pdfDoc.addPage(PAGE_SIZE);
    y = PAGE_SIZE[1] - MARGIN;
  }

  function ensureSpace(height: number) {
    if (y - height < MARGIN) newPage();
  }

  function drawLine(text: string, opts: { bold?: boolean; size?: number; color?: [number, number, number] } = {}) {
    const size = opts.size ?? 11;
    ensureSpace(size + 6);
    page.drawText(text, {
      x: MARGIN,
      y,
      size,
      font: opts.bold ? boldFont : font,
      color: opts.color ? rgb(...opts.color) : rgb(0, 0, 0),
    });
    y -= size + 6;
  }

  // Wraps at the page width — used for "note" fields (disclosure text,
  // checklists), which are too long to fit drawLine's single-line-per-field
  // assumption. Preserves the schema author's own line breaks as paragraphs.
  function drawWrappedText(text: string, opts: { size?: number; color?: [number, number, number] } = {}) {
    const size = opts.size ?? 9.5;
    const maxWidth = PAGE_SIZE[0] - MARGIN * 2;

    for (const paragraph of text.split("\n")) {
      if (!paragraph.trim()) {
        y -= size + 4;
        continue;
      }
      let line = "";
      for (const word of paragraph.split(" ")) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
          drawLine(line, { size, color: opts.color });
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) drawLine(line, { size, color: opts.color });
    }
  }

  drawLine(templateName, { bold: true, size: 18 });
  drawLine(
    variant === "blank"
      ? "Blank form template"
      : variant === "draft"
        ? "Draft snapshot — not yet submitted"
        : "Submitted form",
    { size: 9, color: [0.4, 0.4, 0.4] }
  );
  y -= 8;

  for (const section of schema.sections) {
    ensureSpace(24);
    drawLine(section.label, { bold: true, size: 13, color: [0.05, 0.2, 0.45] });

    for (const field of section.fields) {
      if (field.type === "note") {
        if (field.label) drawLine(field.label, { bold: true, size: 10.5 });
        if (field.helpText) drawWrappedText(field.helpText);
        continue;
      }
      const value = variant === "blank" ? "" : formatValue(dataJson?.[field.key]);
      drawLine(`${field.label}: ${variant === "blank" ? "____________________" : value}`);
    }

    if (section.repeatable) {
      const rowCount =
        variant === "blank"
          ? (section.repeatable.minRows ?? 1)
          : Array.isArray(dataJson?.[section.key])
            ? (dataJson![section.key] as unknown[]).length
            : 0;
      const rows =
        variant !== "blank" && Array.isArray(dataJson?.[section.key])
          ? (dataJson![section.key] as Record<string, unknown>[])
          : [];

      if (rowCount === 0) {
        drawLine("(none provided)", { size: 9.5, color: [0.5, 0.5, 0.5] });
      }
      for (let i = 0; i < rowCount; i++) {
        ensureSpace(14 * section.repeatable.rowFields.length + 16);
        drawLine(`${i + 1}.`, { bold: true, size: 10.5 });
        for (const rf of section.repeatable.rowFields) {
          const rowValue = variant === "blank" ? "____________________" : formatValue(rows[i]?.[rf.key]);
          drawLine(`   ${rf.label}: ${rowValue}`, { size: 9.5 });
        }
      }
    }

    y -= 6;
  }

  if (variant === "submitted" && signatures.length > 0) {
    ensureSpace(140);
    drawLine("Signatures", { bold: true, size: 13, color: [0.05, 0.2, 0.45] });

    for (const sig of signatures) {
      ensureSpace(110);
      drawLine(`${sig.signerRole}: ${sig.signerName} — ${sig.signedAt.toLocaleString()}`, { size: 10 });

      try {
        const base64 = sig.signatureImg.split(",")[1] ?? sig.signatureImg;
        const pngBytes = Uint8Array.from(Buffer.from(base64, "base64"));
        const pngImage = await pdfDoc.embedPng(pngBytes);
        const dims = pngImage.scaleToFit(200, 60);
        ensureSpace(dims.height + 10);
        page.drawImage(pngImage, { x: MARGIN, y: y - dims.height, width: dims.width, height: dims.height });
        y -= dims.height + 10;
      } catch {
        drawLine("[signature image could not be rendered]", { size: 9, color: [0.6, 0.2, 0.2] });
      }
    }
  }

  drawWatermark(page);

  return pdfDoc.save();
}
