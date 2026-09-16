import { useEffect, useState } from "react";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SIGN_MEANING, makeSignature } from "@/lib/signature";
import type { Note, NoteSignature, SignatureKind, StaffMark } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  staffMark?: StaffMark;
  onSigned: (signature: NoteSignature, saveMark: boolean) => void;
};

export function SignDialog({ open, onOpenChange, note, staffMark, onSigned }: Props) {
  const [kind, setKind] = useState<SignatureKind>("drawn");
  const [drawn, setDrawn] = useState<string | null>(null);
  const [typed, setTyped] = useState(note.author);
  const [attest, setAttest] = useState(false);
  const [saveMark, setSaveMark] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKind(staffMark?.kind ?? "drawn");
    setDrawn(staffMark?.kind === "drawn" ? staffMark.imageDataUrl ?? null : null);
    setTyped(staffMark?.typedName || note.author);
    setAttest(false);
    setSaveMark(false);
  }, [open, note.author, staffMark]);

  const ready =
    attest &&
    (kind === "drawn" ? Boolean(drawn) : Boolean(typed.trim()));

  function applyStaff() {
    if (!staffMark) return;
    setKind(staffMark.kind);
    if (staffMark.kind === "drawn") setDrawn(staffMark.imageDataUrl ?? null);
    else setTyped(staffMark.typedName || note.author);
  }

  function submit() {
    if (!ready) return;
    const signature = makeSignature(note, {
      kind,
      imageDataUrl: drawn ?? undefined,
      typedName: typed,
    });
    onSigned(signature, saveMark);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Digital signature</DialogTitle>
          <DialogDescription>
            Sign as {note.author}
            {note.authorTitle ? `, ${note.authorTitle}` : ""}. The mark is bound
            to this letter — editing the note later clears it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setKind("drawn")}
            className={cn(
              "h-10 rounded-md text-sm font-medium",
              kind === "drawn" ? "bg-card text-foreground" : "text-muted-foreground",
            )}
          >
            Draw
          </button>
          <button
            type="button"
            onClick={() => setKind("typed")}
            className={cn(
              "h-10 rounded-md text-sm font-medium",
              kind === "typed" ? "bg-card text-foreground" : "text-muted-foreground",
            )}
          >
            Type
          </button>
        </div>

        {staffMark ? (
          <Button type="button" variant="outline" size="sm" onClick={applyStaff}>
            Use saved staff mark
          </Button>
        ) : null}

        {kind === "drawn" ? (
          <div className="grid gap-2">
            {drawn && staffMark?.kind === "drawn" && drawn === staffMark.imageDataUrl ? (
              <div className="rounded-md border border-border bg-paper p-3">
                <img
                  src={drawn}
                  alt="Saved signature"
                  className="h-16 w-auto max-w-full object-contain object-left"
                />
                <button
                  type="button"
                  className="mt-2 h-11 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setDrawn(null)}
                >
                  Draw a new one
                </button>
              </div>
            ) : (
              <SignaturePad key={open ? "open" : "closed"} onChange={setDrawn} />
            )}
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="typed-sig">Name as it should appear</Label>
            <Input
              id="typed-sig"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="name"
            />
            <p className="font-signature text-4xl leading-none text-foreground">
              {typed.trim() || " "}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setAttest((v) => !v)}
          className={cn(
            "flex min-h-11 items-start gap-2 rounded-md border px-3 py-2.5 text-left text-sm",
            attest
              ? "border-primary bg-muted text-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          <span className="w-3 shrink-0 font-semibold">{attest ? "X" : "_"}</span>
          <span>{SIGN_MEANING}</span>
        </button>

        <button
          type="button"
          onClick={() => setSaveMark((v) => !v)}
          className="flex min-h-11 items-center gap-2 text-left text-sm text-muted-foreground hover:text-foreground"
        >
          <span className="w-3 font-semibold">{saveMark ? "X" : "_"}</span>
          Save as my staff mark for the next letter
        </button>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!ready}>
            Apply signature
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
