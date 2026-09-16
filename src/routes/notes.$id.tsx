import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, PenLine, Printer, Stamp, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Letter } from "@/components/letter";
import { LetterStage } from "@/components/letter-stage";
import { NoteForm } from "@/components/note-form";
import { SignDialog } from "@/components/sign-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCareStamp, formatLastFirst } from "@/lib/format";
import { hrSummary } from "@/lib/note-text";
import { isSignatureValid } from "@/lib/signature";
import { useDesk } from "@/lib/store";
import { getTemplate, statusBadgeVariant, statusLabel } from "@/lib/templates";
import type { NoteSignature } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notes/$id")({ component: NoteEditor });

function NoteEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const note = useDesk((s) => s.notes.find((n) => n.id === id));
  const employee = useDesk((s) =>
    note ? s.employees.find((e) => e.id === note.employeeId) : undefined,
  );
  const org = useDesk((s) => s.org);
  const updateNote = useDesk((s) => s.updateNote);
  const applySignature = useDesk((s) => s.applySignature);
  const clearSignature = useDesk((s) => s.clearSignature);
  const issueNote = useDesk((s) => s.issueNote);
  const voidNote = useDesk((s) => s.voidNote);
  const duplicateNote = useDesk((s) => s.duplicateNote);
  const removeNote = useDesk((s) => s.removeNote);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [signOpen, setSignOpen] = useState(false);
  const [afterSign, setAfterSign] = useState<"none" | "issue" | "print">("none");

  if (!note || !employee) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="font-display text-2xl font-medium">Note not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been deleted on this device.
          </p>
          <Button asChild className="mt-6">
            <Link to="/notes">Back to notes</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const current = note;
  const person = employee;
  const template = getTemplate(current.templateId);
  const isDraft = current.status === "draft";
  const isIssued = current.status === "issued";
  const signed = isSignatureValid(current);
  const mustSign = org.requireSignature !== false && !signed;

  function ensureSigned(then: "issue" | "print") {
    if (mustSign) {
      setAfterSign(then);
      setSignOpen(true);
      toast("Sign the letter first");
      return false;
    }
    return true;
  }

  function printLetter() {
    if (current.status === "draft") {
      if (!ensureSigned("print")) return;
      if (!issueNote(current.id)) {
        setAfterSign("print");
        setSignOpen(true);
        return;
      }
      toast("Letter issued");
    }
    window.setTimeout(() => window.print(), 50);
  }

  function issueOnly() {
    if (!ensureSigned("issue")) return;
    if (!issueNote(current.id)) {
      setAfterSign("issue");
      setSignOpen(true);
      return;
    }
    toast("Letter issued");
  }

  function onSigned(signature: NoteSignature, saveMark: boolean) {
    applySignature(current.id, signature, saveMark);
    toast("Letter signed");
    const next = afterSign;
    setAfterSign("none");
    if (next === "none") return;
    window.setTimeout(() => {
      const ok = issueNote(current.id);
      if (!ok) return;
      toast("Letter issued");
      if (next === "print") window.setTimeout(() => window.print(), 50);
    }, 30);
  }

  function duplicate() {
    const copy = duplicateNote(current.id);
    if (!copy) return;
    toast("Draft copy created");
    void navigate({ to: "/notes/$id", params: { id: copy.id } });
  }

  function remove() {
    if (!window.confirm("Delete this note?")) return;
    removeNote(current.id);
    toast("Note deleted");
    void navigate({ to: "/notes" });
  }

  function voidIssued() {
    if (!window.confirm("Void this issued letter? Keep a copy by duplicating first.")) {
      return;
    }
    voidNote(current.id);
    toast("Letter voided");
  }

  async function copyHr() {
    try {
      await navigator.clipboard.writeText(hrSummary(current, person, org));
      toast("Copied a summary for HR");
    } catch {
      toast("Could not copy");
    }
  }

  return (
    <AppShell
      title={formatLastFirst(person.lastName, person.firstName)}
      action={
        <div className="flex items-center gap-2">
          <Badge variant={statusBadgeVariant(current.status)}>
            {statusLabel(current.status)}
          </Badge>
          {signed ? (
            <Badge variant="issued" className="hidden sm:inline-flex">
              Signed
            </Badge>
          ) : null}
          <Button size="sm" onClick={printLetter} className="hidden sm:inline-flex">
            <Printer />
            Print / PDF
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-6xl">
        <div className="no-print mb-5 flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/notes">
              <ArrowLeft />
              Notes
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-medium tracking-tight">
            {template.title}
          </h1>
        </div>

        <div className="no-print mb-4 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={cn(
              "h-10 rounded-md text-sm font-medium",
              tab === "edit" ? "bg-card text-foreground" : "text-muted-foreground",
            )}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "h-10 rounded-md text-sm font-medium",
              tab === "preview" ? "bg-card text-foreground" : "text-muted-foreground",
            )}
          >
            Letter
          </button>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <section
            className={cn(
              "no-print rounded-xl border border-border bg-card p-5",
              tab === "preview" && "hidden lg:block",
            )}
          >
            <div className="mb-4 text-sm text-muted-foreground">
              {formatLastFirst(person.lastName, person.firstName)} · MRN{" "}
              {person.employeeId}
              {person.department ? ` · ${person.department}` : ""}
            </div>
            <NoteForm
              note={current}
              onChange={(patch) => updateNote(current.id, patch)}
            />

            <div className="mt-5 rounded-lg border border-border bg-muted/60 p-3">
              <div className="text-sm font-medium">Digital signature</div>
              {signed && current.signature ? (
                <div className="mt-2">
                  {current.signature.kind === "drawn" && current.signature.imageDataUrl ? (
                    <img
                      src={current.signature.imageDataUrl}
                      alt="Signature"
                      className="h-12 w-auto max-w-full object-contain object-left"
                    />
                  ) : (
                    <p className="font-signature text-3xl leading-none">
                      {current.signature.typedName}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Signed {formatCareStamp(current.signature.signedAt)}
                  </p>
                  {isDraft ? (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAfterSign("none");
                          setSignOpen(true);
                        }}
                      >
                        Re-sign
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          clearSignature(current.id);
                          toast("Signature cleared");
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {org.requireSignature !== false
                      ? "Required before the letter can be issued."
                      : "Optional. Prints on the letter if added."}
                  </p>
                  {isDraft ? (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        setAfterSign("none");
                        setSignOpen(true);
                      }}
                    >
                      <PenLine />
                      Sign letter
                    </Button>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Issued without a captured mark.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={printLetter}>
                <Printer />
                {isDraft ? "Issue & print" : "Print / PDF"}
              </Button>
              {isDraft ? (
                <Button variant="outline" onClick={issueOnly}>
                  <Stamp />
                  Issue without printing
                </Button>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={copyHr}>
                  <Copy />
                  Copy for HR
                </Button>
                <Button variant="outline" onClick={duplicate}>
                  Duplicate
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {isIssued ? (
                  <Button variant="outline" onClick={voidIssued}>
                    Void
                  </Button>
                ) : (
                  <span />
                )}
                <Button variant="ghost" onClick={remove}>
                  <Trash2 />
                  Delete
                </Button>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                Saved on this device. Print and choose Save as PDF for a file.
              </p>
            </div>
          </section>

          <section
            className={cn(
              "letter-stage-wrap",
              tab === "edit" && "hidden lg:block",
            )}
          >
            <LetterStage>
              <Letter note={current} employee={person} org={org} />
            </LetterStage>
          </section>
        </div>
      </div>

      <div className="letter-print-only">
        <Letter note={current} employee={person} org={org} />
      </div>

      <SignDialog
        open={signOpen}
        onOpenChange={setSignOpen}
        note={current}
        staffMark={org.staffMark}
        onSigned={onSigned}
      />
    </AppShell>
  );
}
