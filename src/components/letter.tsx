import { ClinicMark } from "@/components/clinic-mark";
import { SignatureMark } from "@/components/signature-mark";
import {
  ageYears,
  formatAuthor,
  formatCareStamp,
  formatDob,
  formatLastFirst,
  formatLongDateTime,
  formatShortDate,
} from "@/lib/format";
import { isSignatureValid } from "@/lib/signature";
import { getTemplate, WORK_STATUS_LABEL } from "@/lib/templates";
import type { Employee, Note, OrgSettings, WorkStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

function blank(value: string, width = 18) {
  const v = value.trim();
  if (v) return v;
  return "_".repeat(width);
}

function StatusBox({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className={cn(
          "inline-block w-3 text-center font-semibold",
          checked ? "text-ink" : "text-ink/45",
        )}
      >
        {checked ? "X" : "_"}
      </span>
      <span>{label}</span>
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(10.5rem,12rem)_1fr] gap-x-4">
      <div>{label}:</div>
      <div>{value}</div>
    </div>
  );
}

function dutyBoxesFor(note: Note): WorkStatus[] {
  if (note.templateId === "absence" || note.templateId === "leave") {
    return ["off-duty", "full-duty"];
  }
  if (note.templateId === "modified-duty" || note.workStatus === "restricted") {
    return ["light-duty", "full-duty", "restricted"];
  }
  if (note.workStatus === "off-duty") {
    return ["light-duty", "full-duty", "off-duty"];
  }
  return ["light-duty", "full-duty"];
}

export function Letter({
  note,
  employee,
  org,
}: {
  note: Note;
  employee: Employee;
  org: OrgSettings;
}) {
  const template = getTemplate(note.templateId);
  const displayName = formatLastFirst(employee.lastName, employee.firstName);
  const age = ageYears(employee.dob, note.serviceDate);
  const stamp = formatLongDateTime(note.serviceDate);
  const careStamp = formatCareStamp(note.datesOfCare || note.serviceDate);
  const authorLine = formatAuthor(note.author, note.authorTitle);
  const signedAt = note.signature && isSignatureValid(note)
    ? note.signature.signedAt
    : note.issuedAt || note.serviceDate;
  const signedWho =
    note.signature && isSignatureValid(note)
      ? formatAuthor(note.signature.signerName, note.signature.signerTitle)
      : authorLine;
  const signed = `${signedWho} on ${formatLongDateTime(signedAt)}`;
  const printedOn = formatCareStamp(note.issuedAt || signedAt);
  const clinicPlace = [org.name, org.location].filter(Boolean).join(" - ");
  const visit = [
    note.fin,
    clinicPlace,
    org.visitType,
    `${formatShortDate(note.serviceDate)} -`,
  ]
    .filter(Boolean)
    .join(", ");

  const showStatus = template.fields.includes("workStatus");
  const showReturn = template.fields.includes("returnDate");
  const showAbsence = template.fields.includes("absence");
  const showRestrictions =
    template.fields.includes("restrictions") || Boolean(note.restrictions.trim());
  const showSchool = template.fields.includes("schoolName");
  const statusBoxes = dutyBoxesFor(note);
  const returnLabel =
    note.templateId === "return-to-school" ? "School" : "Work";

  return (
    <article
      className={cn(
        "letter-sheet relative text-ink",
        note.status === "draft" && "letter-draft",
        note.status === "void" && "letter-void",
      )}
    >
      <header className="flex items-start justify-between gap-4 text-[0.95rem]">
        <span>{template.headerType}</span>
        <span className="text-right font-medium tracking-wide">
          {displayName} - {employee.employeeId}
        </span>
      </header>

      <h1 className="mt-10 font-sans text-[1.35rem] font-bold tracking-tight">
        {template.title}
      </h1>

      <section className="mt-6 space-y-1.5">
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-1 font-bold">
          <span>Patient: {displayName}</span>
          <span>MRN: {employee.employeeId}</span>
          <span>FIN: {note.fin}</span>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-1 font-bold">
          <span>Age: {age || "—"} years</span>
          <span>Sex: {employee.sex}</span>
          <span>DOB: {formatDob(employee.dob)}</span>
        </div>
        <p>
          <span className="font-bold">Associated Diagnosis: </span>
          {blank(note.diagnosis, 22)}
        </p>
        <p>
          <span className="font-bold">Author: </span>
          {blank(authorLine, 16)}
        </p>
      </section>

      <div className="mt-10">
        <ClinicMark
          line1={org.markLine1}
          line2={org.markLine2}
          color={org.markColor ?? "teal"}
        />
      </div>

      <h2 className="mt-10 font-sans text-[1.2rem] font-bold">{template.title}</h2>

      <section className="mt-5 space-y-2">
        {showSchool ? <p>School: {blank(note.schoolName, 28)}</p> : null}
        <p>Dates of Care: {careStamp}_</p>
        {showReturn ? (
          <p>
            Return to {returnLabel} Date:{" "}
            {note.returnDate ? `${formatShortDate(note.returnDate)}_` : blank("", 14)}
          </p>
        ) : null}
        {showAbsence ? (
          <p>
            Absence Dates: {formatShortDate(note.absenceStart)}
            {note.absenceEnd ? ` – ${formatShortDate(note.absenceEnd)}` : ""}
            _
          </p>
        ) : null}
        <p>
          Nature of Illness/Injury (if requested): {blank(note.natureOfIllness, 24)}
        </p>
        {showStatus ? (
          <p className="flex flex-wrap items-baseline gap-x-10 gap-y-1">
            <span>Work Status:</span>
            {statusBoxes.map((key) => (
              <StatusBox
                key={key}
                label={WORK_STATUS_LABEL[key]}
                checked={note.workStatus === key}
              />
            ))}
          </p>
        ) : null}
        {showRestrictions ? (
          <p>Restrictions: {blank(note.restrictions, 28)}</p>
        ) : null}
        <p>Comments: {blank(note.comments, 32)}</p>
      </section>

      <SignatureMark note={note} />

      <section className="mt-10 space-y-1 text-[0.95rem]">
        <MetaRow label="Type" value={template.headerType} />
        <MetaRow label="Service Date" value={`${stamp}_`} />
        <MetaRow
          label="Status"
          value={
            note.status === "issued"
              ? "Auth (Verified)"
              : note.status === "void"
                ? "Void"
                : "Draft"
          }
        />
        <MetaRow label="Title" value={template.title} />
        <MetaRow label="Performed By" value={signed} />
        <MetaRow
          label="Electronically Signed By"
          value={
            note.signature && isSignatureValid(note)
              ? `${signed} · Digital`
              : signed
          }
        />
        <MetaRow label="Visit Information" value={visit} />
      </section>

      {org.phone || org.address ? (
        <p className="mt-6 text-[0.8rem] text-ink/70">
          {[org.address, org.phone].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <footer className="mt-auto flex items-end justify-between pt-16 text-[0.85rem]">
        <div className="space-y-0.5">
          <div>Printed by: {authorLine || org.defaultAuthor}</div>
          <div>Printed on: {printedOn}</div>
        </div>
        <div>Page 1 of 1</div>
      </footer>
    </article>
  );
}
