import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { formatLastFirst, formatShortDate } from "@/lib/format";
import { isSignatureValid } from "@/lib/signature";
import { useDesk } from "@/lib/store";
import { getTemplate, statusBadgeVariant, statusLabel } from "@/lib/templates";

export const Route = createFileRoute("/notes/")({ component: NotesList });

function NotesList() {
  const notes = useDesk((s) => s.notes);
  const employees = useDesk((s) => s.employees);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "issued" | "draft" | "void">("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...notes]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((n) => (filter === "all" ? true : n.status === filter))
      .filter((n) => {
        if (!q) return true;
        const employee = employees.find((e) => e.id === n.employeeId);
        const template = getTemplate(n.templateId);
        const hay = `${employee?.firstName ?? ""} ${employee?.lastName ?? ""} ${employee?.employeeId ?? ""} ${template.title} ${n.diagnosis} ${n.fin}`;
        return hay.toLowerCase().includes(q);
      });
  }, [notes, employees, query, filter]);

  return (
    <AppShell title="Notes">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drafts, issued letters, and voids saved on this device.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee, diagnosis, FIN"
            className="sm:flex-1"
          />
          <NativeSelect
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="sm:w-40"
          >
            <option value="all">All</option>
            <option value="issued">Issued</option>
            <option value="draft">Drafts</option>
            <option value="void">Void</option>
          </NativeSelect>
        </div>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            No notes match.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {rows.map((note) => {
              const employee = employees.find((e) => e.id === note.employeeId);
              const template = getTemplate(note.templateId);
              return (
                <li key={note.id}>
                  <Link
                    to="/notes/$id"
                    params={{ id: note.id }}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {employee
                          ? formatLastFirst(employee.lastName, employee.firstName)
                          : "Unknown employee"}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        {template.title} · FIN {note.fin} ·{" "}
                        {formatShortDate(note.serviceDate)}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                      {isSignatureValid(note) ? (
                        <Badge variant="outline">Signed</Badge>
                      ) : null}
                      <Badge variant={statusBadgeVariant(note.status)}>
                        {statusLabel(note.status)}
                      </Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
