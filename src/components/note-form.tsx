import type { ReactNode } from "react";
import { COMMON_DIAGNOSES } from "@/lib/diagnoses";
import { fromDateTimeLocal, toDateTimeLocal } from "@/lib/format";
import { getTemplate, WORK_STATUS_LABEL, WORK_STATUS_OPTIONS } from "@/lib/templates";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NoteForm({
  note,
  onChange,
}: {
  note: Note;
  onChange: (patch: Partial<Note>) => void;
}) {
  const template = getTemplate(note.templateId);
  const fields = new Set(template.fields);
  const showRestrictions =
    fields.has("restrictions") ||
    note.workStatus === "light-duty" ||
    note.workStatus === "restricted";

  function setDiagnosis(value: string) {
    const lockNature =
      !note.natureOfIllness.trim() || note.natureOfIllness === note.diagnosis;
    onChange({
      diagnosis: value,
      natureOfIllness: lockNature ? value : note.natureOfIllness,
    });
  }

  return (
    <div className="grid gap-4">
      {fields.has("schoolName") ? (
        <Field label="School">
          <Input
            value={note.schoolName}
            onChange={(e) => onChange({ schoolName: e.target.value })}
          />
        </Field>
      ) : null}

      {fields.has("diagnosis") ? (
        <Field label="Associated diagnosis">
          <Input
            value={note.diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Upper Respiratory Infection"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {COMMON_DIAGNOSES.map((d) => {
              const on = note.diagnosis === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDiagnosis(d.value)}
                  className={cn(
                    "h-9 rounded-md border px-2.5 text-xs font-medium transition-colors duration-150",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </Field>
      ) : null}

      {fields.has("nature") ? (
        <Field label="Nature of illness / injury">
          <Input
            value={note.natureOfIllness}
            onChange={(e) => onChange({ natureOfIllness: e.target.value })}
          />
        </Field>
      ) : null}

      {fields.has("datesOfCare") ? (
        <Field label="Dates of care / service">
          <Input
            type="datetime-local"
            value={toDateTimeLocal(note.datesOfCare || note.serviceDate)}
            onChange={(e) => {
              const iso = fromDateTimeLocal(e.target.value);
              onChange({ datesOfCare: iso, serviceDate: iso || note.serviceDate });
            }}
          />
        </Field>
      ) : null}

      {fields.has("returnDate") ? (
        <Field
          label={
            note.templateId === "return-to-school"
              ? "Return to school date"
              : "Return to work date"
          }
        >
          <Input
            type="date"
            value={note.returnDate}
            onChange={(e) => onChange({ returnDate: e.target.value })}
          />
        </Field>
      ) : null}

      {fields.has("absence") ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Absence start">
            <Input
              type="date"
              value={note.absenceStart}
              onChange={(e) => onChange({ absenceStart: e.target.value })}
            />
          </Field>
          <Field label="Absence end">
            <Input
              type="date"
              value={note.absenceEnd}
              onChange={(e) => onChange({ absenceEnd: e.target.value })}
            />
          </Field>
        </div>
      ) : null}

      {fields.has("workStatus") ? (
        <fieldset className="grid gap-1.5">
          <Label>Work status</Label>
          <div className="grid grid-cols-2 gap-2">
            {WORK_STATUS_OPTIONS.map((s) => {
              const on = note.workStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange({ workStatus: s })}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-md border px-3 text-left text-sm font-medium transition-colors duration-150",
                    on
                      ? "border-primary bg-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block w-3 text-center font-semibold",
                      on ? "text-foreground" : "text-muted-foreground/60",
                    )}
                  >
                    {on ? "X" : "_"}
                  </span>
                  {WORK_STATUS_LABEL[s]}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {showRestrictions ? (
        <Field label="Restrictions">
          <Textarea
            value={note.restrictions}
            onChange={(e) => onChange({ restrictions: e.target.value })}
            placeholder="No lifting over 15 lbs. Sit / stand as needed."
          />
        </Field>
      ) : null}

      {fields.has("comments") ? (
        <Field label="Comments">
          <Textarea
            value={note.comments}
            onChange={(e) => onChange({ comments: e.target.value })}
            placeholder="Optional"
          />
        </Field>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Author">
          <Input
            value={note.author}
            onChange={(e) => onChange({ author: e.target.value })}
          />
        </Field>
        <Field label="Title">
          <Input
            value={note.authorTitle}
            onChange={(e) => onChange({ authorTitle: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
