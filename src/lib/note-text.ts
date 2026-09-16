import { formatAuthor, formatLastFirst, formatLongDateTime, formatShortDate } from "./format";
import { isSignatureValid } from "./signature";
import { getTemplate, WORK_STATUS_LABEL } from "./templates";
import type { Employee, Note, OrgSettings } from "./types";

export function hrSummary(note: Note, employee: Employee, org: OrgSettings) {
  const template = getTemplate(note.templateId);
  const lines: string[] = [
    template.title.toUpperCase(),
    "",
    `Employee: ${formatLastFirst(employee.lastName, employee.firstName)}`,
    `MRN: ${employee.employeeId}`,
    `FIN: ${note.fin}`,
  ];
  if (employee.department) lines.push(`Department: ${employee.department}`);
  if (employee.jobTitle) lines.push(`Job title: ${employee.jobTitle}`);
  lines.push(`Diagnosis: ${note.diagnosis.trim() || "—"}`);
  if (note.natureOfIllness.trim() && note.natureOfIllness !== note.diagnosis) {
    lines.push(`Nature of illness: ${note.natureOfIllness.trim()}`);
  }
  if (note.returnDate) lines.push(`Return date: ${formatShortDate(note.returnDate)}`);
  if (note.absenceStart) {
    lines.push(
      `Absence: ${formatShortDate(note.absenceStart)}${
        note.absenceEnd ? ` – ${formatShortDate(note.absenceEnd)}` : ""
      }`,
    );
  }
  if (note.workStatus) lines.push(`Work status: ${WORK_STATUS_LABEL[note.workStatus]}`);
  if (note.restrictions.trim()) lines.push(`Restrictions: ${note.restrictions.trim()}`);
  if (note.comments.trim()) lines.push(`Comments: ${note.comments.trim()}`);
  lines.push("");
  lines.push(
    `Status: ${
      note.status === "issued" ? "Auth (Verified)" : note.status === "void" ? "Void" : "Draft"
    }`,
  );
  lines.push(`Issued by: ${formatAuthor(note.author, note.authorTitle)}`);
  if (isSignatureValid(note) && note.signature) {
    lines.push(
      `Digitally signed: ${formatAuthor(note.signature.signerName, note.signature.signerTitle)} at ${formatLongDateTime(note.signature.signedAt)}`,
    );
  }
  lines.push(`Service: ${formatLongDateTime(note.serviceDate)}`);
  lines.push([org.name, org.location].filter(Boolean).join(" — "));
  return lines.join("\n");
}
