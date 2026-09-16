import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FilePlus, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLastFirst, formatShortDate, todayIsoDate } from "@/lib/format";
import { useDesk } from "@/lib/store";
import { getTemplate, statusBadgeVariant, statusLabel, WORK_STATUS_LABEL } from "@/lib/templates";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const employees = useDesk((s) => s.employees);
  const notes = useDesk((s) => s.notes);
  const org = useDesk((s) => s.org);
  const issued = notes.filter((n) => n.status === "issued");
  const drafts = notes.filter((n) => n.status === "draft");
  const today = todayIsoDate();
  const returning = issued
    .filter((n) => n.returnDate && n.returnDate >= today)
    .sort((a, b) => a.returnDate.localeCompare(b.returnDate));
  const recent = [...notes]
    .filter((n) => n.status !== "void")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <AppShell title={`${org.name} · ${org.location}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="rounded-xl bg-sidebar px-5 py-7 text-sidebar-foreground sm:px-8">
          <p className="text-xs font-medium tracking-[0.16em] text-sidebar-muted uppercase">
            {org.markLine1} {org.markLine2}
          </p>
          <h1 className="mt-3 max-w-lg font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Issue a work-status note
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-sidebar-muted">
            Clinic letters for HR — return-to-work waivers, absences, and duty
            restrictions in the same format occupational health prints.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-card text-foreground hover:bg-background">
              <Link to="/new">
                <FilePlus />
                New note
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-sidebar-foreground hover:bg-sidebar-hover"
            >
              <Link to="/employees">
                <Users />
                Employees
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <Stat label="Employees" value={employees.length} />
          <Stat label="Issued" value={issued.length} />
          <Stat label="Drafts" value={drafts.length} />
        </section>

        {returning.length > 0 ? (
          <section>
            <h2 className="mb-3 font-display text-xl font-medium tracking-tight">
              Returning to duty
            </h2>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {returning.map((note) => {
                const employee = employees.find((e) => e.id === note.employeeId);
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
                          {note.workStatus
                            ? WORK_STATUS_LABEL[note.workStatus]
                            : "Status on file"}
                          {note.diagnosis ? ` · ${note.diagnosis}` : ""}
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium tabular-nums">
                        {formatShortDate(note.returnDate)}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2">
          <QuickCard
            to="/new"
            title="Start from a template"
            body="Return to work, school excuse, light duty, leave."
          />
          <QuickCard
            to="/settings"
            title="Clinic letterhead"
            body="Name, mark, and default signer print on every note."
          />
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Recent notes
            </h2>
            <Link
              to="/notes"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
              No notes yet. Issue the first one from a template.
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {recent.map((note) => {
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
                          {template.short} · {formatShortDate(note.serviceDate)}
                        </div>
                      </div>
                      <Badge variant={statusBadgeVariant(note.status)}>
                        {statusLabel(note.status)}
                      </Badge>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-medium tabular-nums">
        {value}
      </div>
    </div>
  );
}

function QuickCard({
  to,
  title,
  body,
}: {
  to: "/new" | "/settings";
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card px-5 py-5 transition-colors duration-150 hover:bg-muted"
    >
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </Link>
  );
}
