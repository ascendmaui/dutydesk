# DutyDesk Clinical Signature & Document Integrity

This document outlines the tamper-detection invariants, digital signature generation, and verification model in DutyDesk.

---

## 1. Document Integrity Model

In an occupational health or clinic setting, work-status notes (return-to-work waivers, duty restrictions, absence authorizations) require tamper-evident integrity.

When an authorized clinician signs a note:
1. An attestation string (`SIGN_MEANING`) is confirmed.
2. A deterministic document fingerprint (`noteFingerprint`) is computed across all clinical and administrative fields using unit separator delimiters (`\u001f`).
3. The signature record (`NoteSignature`) stores:
   - `kind`: `'drawn'` (canvas stroke data URL) or `'typed'` (typed provider name).
   - `signedAt`: ISO timestamp.
   - `signerName` & `signerTitle`.
   - `fingerprint`: Document digest snapshot.

```
[Clinical Note Fields]
  (employeeId, dates, diagnosis, workStatus, restrictions, etc.)
                   |
                   v
       [noteFingerprint(note)]
                   |
                   +---> Stored in note.signature.fingerprint
```

---

## 2. Invalidation & Tamper Detection Invariant

> [!IMPORTANT]
> **Clinical Integrity Invariant:** If any clinical or administrative field in a signed note is modified, the signature is rendered immediately **invalid** (`isSignatureValid(note) === false`).
>
> The note will show as requiring re-attestation before print-to-PDF or distribution.

Fields covered by the fingerprint:
- `templateId`
- `employeeId`
- `diagnosis`
- `natureOfIllness`
- `datesOfCare`
- `returnDate`
- `workStatus`
- `comments`
- `restrictions`
- `absenceStart`
- `absenceEnd`
- `schoolName`
- `author`
- `authorTitle`
- `serviceDate`
- `fin`

---

## 3. Verification Rules

A signature is valid if and only if:
1. `note.signature` is non-null.
2. `note.signature.fingerprint === noteFingerprint(note)`.
3. If `kind === "drawn"`, `imageDataUrl` is non-empty.
4. If `kind === "typed"`, `typedName` is trimmed and non-empty.
