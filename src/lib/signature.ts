import { nowIso } from "./format";
import type { Note, NoteSignature, SignatureKind, StaffMark } from "./types";

export const SIGN_MEANING =
  "I attest this work-status note is complete and accurate, and I am authorized to issue it.";

export function noteFingerprint(note: Note) {
  return [
    note.templateId,
    note.employeeId,
    note.diagnosis,
    note.natureOfIllness,
    note.datesOfCare,
    note.returnDate,
    note.workStatus,
    note.comments,
    note.restrictions,
    note.absenceStart,
    note.absenceEnd,
    note.schoolName,
    note.author,
    note.authorTitle,
    note.serviceDate,
    note.fin,
  ].join("\u001f");
}

export function isSignatureValid(note: Note) {
  const sig = note.signature;
  if (!sig) return false;
  if (sig.fingerprint !== noteFingerprint(note)) return false;
  if (sig.kind === "drawn") return Boolean(sig.imageDataUrl);
  return Boolean(sig.typedName?.trim());
}

export function makeSignature(
  note: Note,
  input: { kind: SignatureKind; imageDataUrl?: string; typedName?: string },
  signedAt = nowIso(),
): NoteSignature {
  return {
    kind: input.kind,
    imageDataUrl: input.kind === "drawn" ? input.imageDataUrl : undefined,
    typedName: input.kind === "typed" ? input.typedName?.trim() : undefined,
    signedAt,
    signerName: note.author,
    signerTitle: note.authorTitle,
    fingerprint: noteFingerprint(note),
  };
}

export function staffMarkFromSignature(sig: NoteSignature): StaffMark {
  return {
    kind: sig.kind,
    imageDataUrl: sig.imageDataUrl,
    typedName: sig.typedName,
  };
}
