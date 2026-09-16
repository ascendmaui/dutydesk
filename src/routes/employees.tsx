import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FilePlus, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmployeeDialog } from "@/components/employee-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDob, formatLastFirst } from "@/lib/format";
import { useDesk } from "@/lib/store";
import type { Employee } from "@/lib/types";

export const Route = createFileRoute("/employees")({ component: EmployeeRoster });

function EmployeeRoster() {
  const employees = useDesk((s) => s.employees);
  const notes = useDesk((s) => s.notes);
  const removeEmployee = useDesk((s) => s.removeEmployee);
  const createNote = useDesk((s) => s.createNote);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName} ${e.employeeId} ${e.department} ${e.jobTitle}`
        .toLowerCase()
        .includes(q),
    );
  }, [employees, query]);

  function issueFor(employee: Employee) {
    const note = createNote("return-to-work", employee.id);
    void navigate({ to: "/notes/$id", params: { id: note.id } });
  }

  function remove(employee: Employee) {
    const count = notes.filter((n) => n.employeeId === employee.id).length;
    const extra = count
      ? ` This also deletes ${count} note${count === 1 ? "" : "s"}.`
      : "";
    if (!window.confirm(`Remove ${employee.firstName} ${employee.lastName}?${extra}`)) {
      return;
    }
    removeEmployee(employee.id);
    toast("Employee removed");
  }

  return (
    <AppShell
      title="Employees"
      action={
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Add
        </Button>
      }
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            Employees
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Roster used to fill patient name, DOB, and MRN on each letter.
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roster"
        />
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            No employees yet.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {rows.map((employee) => {
              const count = notes.filter((n) => n.employeeId === employee.id).length;
              return (
                <li
                  key={employee.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {formatLastFirst(employee.lastName, employee.firstName)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      MRN {employee.employeeId} · DOB {formatDob(employee.dob)}
                      {employee.department ? ` · ${employee.department}` : ""}
                      {count
                        ? ` · ${count} note${count === 1 ? "" : "s"}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => issueFor(employee)}>
                      <FilePlus />
                      Note
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(employee);
                        setOpen(true);
                      }}
                    >
                      <Pencil />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(employee)}
                    >
                      <Trash2 />
                      Remove
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <EmployeeDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        employee={editing}
      />
    </AppShell>
  );
}
