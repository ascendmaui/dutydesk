import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ClinicMark } from "@/components/clinic-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultOrg, useDesk } from "@/lib/store";
import type { MarkColor } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: ClinicSettings });

const MARK_COLORS: { id: MarkColor; label: string }[] = [
  { id: "teal", label: "Teal" },
  { id: "navy", label: "Navy" },
  { id: "forest", label: "Forest" },
];

function ClinicSettings() {
  const org = useDesk((s) => s.org);
  const setOrg = useDesk((s) => s.setOrg);
  const markColor = org.markColor ?? "teal";

  return (
    <AppShell title="Clinic letterhead">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            Clinic letterhead
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prints on every note. Change this to your practice or plant clinic.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <ClinicMark
            line1={org.markLine1}
            line2={org.markLine2}
            color={markColor}
          />
        </div>

        <form
          className="grid gap-4 rounded-xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            toast("Letterhead saved");
          }}
        >
          <Field label="Organization name">
            <Input
              value={org.name}
              onChange={(e) => setOrg({ name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mark line 1">
              <Input
                value={org.markLine1}
                onChange={(e) => setOrg({ markLine1: e.target.value })}
              />
            </Field>
            <Field label="Mark line 2">
              <Input
                value={org.markLine2}
                onChange={(e) => setOrg({ markLine2: e.target.value })}
              />
            </Field>
          </div>
          <fieldset className="grid gap-1.5">
            <Label>Mark color</Label>
            <div className="grid grid-cols-3 gap-2">
              {MARK_COLORS.map((c) => {
                const on = markColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setOrg({ markColor: c.id })}
                    className={cn(
                      "flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-medium",
                      on
                        ? "border-primary bg-muted text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "size-3 rounded-full",
                        c.id === "teal" && "bg-mark-teal",
                        c.id === "navy" && "bg-primary",
                        c.id === "forest" && "bg-ok",
                      )}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <Field label="Location (prints after the clinic name)">
            <Input
              value={org.location}
              onChange={(e) => setOrg({ location: e.target.value })}
            />
          </Field>
          <Field label="Address">
            <Input
              value={org.address}
              onChange={(e) => setOrg({ address: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={org.phone}
              onChange={(e) => setOrg({ phone: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Default author">
              <Input
                value={org.defaultAuthor}
                onChange={(e) => setOrg({ defaultAuthor: e.target.value })}
              />
            </Field>
            <Field label="Author title">
              <Input
                value={org.defaultAuthorTitle}
                onChange={(e) => setOrg({ defaultAuthorTitle: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Visit type">
            <Input
              value={org.visitType}
              onChange={(e) => setOrg({ visitType: e.target.value })}
            />
          </Field>
          <button
            type="button"
            onClick={() =>
              setOrg({ requireSignature: !(org.requireSignature !== false) })
            }
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-md border px-3 text-left text-sm font-medium",
              org.requireSignature !== false
                ? "border-primary bg-muted text-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            <span className="w-3 font-semibold">
              {org.requireSignature !== false ? "X" : "_"}
            </span>
            Require a digital signature before issuing
          </button>
          {org.staffMark ? (
            <div className="rounded-md border border-border bg-muted/60 p-3">
              <div className="text-sm font-medium">Saved staff mark</div>
              {org.staffMark.kind === "drawn" && org.staffMark.imageDataUrl ? (
                <img
                  src={org.staffMark.imageDataUrl}
                  alt="Saved signature"
                  className="mt-2 h-12 w-auto object-contain object-left"
                />
              ) : (
                <p className="mt-2 font-signature text-3xl leading-none">
                  {org.staffMark.typedName}
                </p>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  setOrg({ staffMark: undefined });
                  toast("Staff mark removed");
                }}
              >
                Remove saved mark
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sign a letter and check “save as my staff mark” to reuse it.
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOrg(defaultOrg);
                toast("Restored default letterhead");
              }}
            >
              Restore sample
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </AppShell>
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
