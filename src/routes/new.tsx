import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmployeeDialog } from "@/components/employee-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatLastFirst } from "@/lib/format";
import { useDesk } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import type { Employee, TemplateId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/new")({ component: NewNote });

function NewNote() {
  const navigate = useNavigate();
  const employees = useDesk((s) => s.employees);
  const createNote = useDesk((s) => s.createNote);
  const [templateId, setTemplateId] = useState<TemplateId>("return-to-work");
  const [employeeId, setEmployeeId] = useState<string>(employees[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName} ${e.employeeId} ${e.department}`
        .toLowerCase()
        .includes(q),
    );
  }, [employees, query]);

  function start() {
    if (!employeeId) return;
    const note = createNote(templateId, employeeId);
    void navigate({ to: "/notes/$id", params: { id: note.id } });
  }

  function onCreated(employee: Employee) {
    setEmployeeId(employee.id);
  }

  return (
    <AppShell title="New note">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            New note
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a letter type, then the employee it covers.
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            1. Template
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {TEMPLATES.map((t) => {
              const selected = t.id === templateId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    "rounded-xl border px-4 py-4 text-left transition-colors duration-150",
                    selected
                      ? "border-primary bg-card"
                      : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{t.title}</span>
                    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                      {t.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              2. Employee
            </h2>
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              Add employee
            </Button>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, MRN, department"
            className="mb-3"
          />
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              No matching employees.
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {filtered.map((e) => (
                <EmployeeRow
                  key={e.id}
                  employee={e}
                  selected={e.id === employeeId}
                  onSelect={() => setEmployeeId(e.id)}
                />
              ))}
            </ul>
          )}
        </section>

        <div className="flex justify-end">
          <Button onClick={start} disabled={!employeeId} className="min-w-40">
            Open letter
          </Button>
        </div>
      </div>
      <EmployeeDialog open={open} onOpenChange={setOpen} onCreated={onCreated} />
    </AppShell>
  );
}

function EmployeeRow({
  employee,
  selected,
  onSelect,
}: {
  employee: Employee;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3.5 text-left",
          selected ? "bg-muted" : "hover:bg-muted/70",
        )}
      >
        <span
          className={cn(
            "size-3 shrink-0 rounded-full border",
            selected ? "border-primary bg-primary" : "border-border bg-card",
          )}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">
            {formatLastFirst(employee.lastName, employee.firstName)}
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            MRN {employee.employeeId}
            {employee.department ? ` · ${employee.department}` : ""}
          </span>
        </span>
      </button>
    </li>
  );
}
