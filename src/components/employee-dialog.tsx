import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
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
import { NativeSelect } from "@/components/ui/native-select";
import { useDesk } from "@/lib/store";
import type { Employee, Sex } from "@/lib/types";

const SEXES: Sex[] = ["Female", "Male", "Other", "Undisclosed"];

const empty = {
  firstName: "",
  lastName: "",
  dob: "",
  sex: "Female" as Sex,
  employeeId: "",
  department: "",
  jobTitle: "",
};

export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onCreated?: (employee: Employee) => void;
}) {
  const addEmployee = useDesk((s) => s.addEmployee);
  const updateEmployee = useDesk((s) => s.updateEmployee);
  const [form, setForm] = useState(empty);

  const editing = Boolean(employee);

  function syncOpen(next: boolean) {
    if (next) {
      if (employee) {
        setForm({
          firstName: employee.firstName,
          lastName: employee.lastName,
          dob: employee.dob,
          sex: employee.sex,
          employeeId: employee.employeeId,
          department: employee.department,
          jobTitle: employee.jobTitle,
        });
      } else {
        setForm(empty);
      }
    }
    onOpenChange(next);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast("First and last name are required");
      return;
    }
    if (!form.dob) {
      toast("Date of birth is required");
      return;
    }
    if (employee) {
      updateEmployee(employee.id, {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        employeeId: form.employeeId.trim() || employee.employeeId,
        department: form.department.trim(),
        jobTitle: form.jobTitle.trim(),
      });
      toast("Employee updated");
      onOpenChange(false);
      return;
    }
    const created = addEmployee(form);
    toast("Employee added");
    onOpenChange(false);
    onCreated?.(created);
  }

  return (
    <Dialog open={open} onOpenChange={syncOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            Used on the note as patient name, DOB, and MRN.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                autoComplete="given-name"
                required
              />
            </Field>
            <Field label="Last name">
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                autoComplete="family-name"
                required
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of birth">
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                required
              />
            </Field>
            <Field label="Sex">
              <NativeSelect
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}
              >
                {SEXES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field label="Employee / MRN">
            <Input
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              placeholder="Assigned if left blank"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <Input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </Field>
            <Field label="Job title">
              <Input
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save" : "Add employee"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
