# DutyDesk

Clinic desk for issuing employee work-status letters — return-to-work waivers, absences, and duty restrictions — with a live letter preview, print-to-PDF, and digital signatures.

Notes and the employee roster stay in the browser on this device. Change the letterhead under **Letterhead** to your clinic name, mark, and signer.

## Documentation

- [Clinical Signature & Document Integrity](docs/SIGNATURE_VERIFICATION.md) — Attestation model, document fingerprinting, and tamper-invalidation invariants.

## Scripts

```bash
npm install
npm run dev         # local preview (Vite :8080)
npm run build
npm run typecheck
npm test
npm run lint
```

## Stack

React 19, TanStack Start, Tailwind v4, Zustand, TypeScript.
