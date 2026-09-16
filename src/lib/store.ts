import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDaysIso, nowIso, todayIsoDate } from "./format";
import { isSignatureValid, makeSignature, noteFingerprint } from "./signature";
import { getTemplate } from "./templates";
import type { Employee, Note, NoteSignature, OrgSettings, TemplateId } from "./types";
import { uid } from "./utils";

export const defaultOrg: OrgSettings = {
  name: "Plant Health Clinic",
  markLine1: "Plant Health",
  markLine2: "Clinic",
  markColor: "teal",
  location: "Greer",
  address: "Greer, South Carolina",
  phone: "(864) 555-0140",
  defaultAuthor: "Alicia Kelley",
  defaultAuthorTitle: "PSR",
  visitType: "Outpatient",
  requireSignature: true,
};

function seedEmployees(): Employee[] {
  const createdAt = "2026-09-02T14:10:00.000Z";
  return [
    {
      id: "emp_hale",
      firstName: "Jordan",
      lastName: "Hale",
      dob: "1992-03-12",
      sex: "Female",
      employeeId: "5018821",
      department: "Logistics",
      jobTitle: "Material Handler",
      createdAt,
    },
    {
      id: "emp_chen",
      firstName: "Maya",
      lastName: "Chen",
      dob: "1988-11-02",
      sex: "Female",
      employeeId: "5018834",
      department: "Paint Shop",
      jobTitle: "Line Technician",
      createdAt,
    },
    {
      id: "emp_brooks",
      firstName: "Ellis",
      lastName: "Brooks",
      dob: "1996-07-19",
      sex: "Male",
      employeeId: "5018840",
      department: "Assembly",
      jobTitle: "Production Associate",
      createdAt,
    },
    {
      id: "emp_vargas",
      firstName: "Sam",
      lastName: "Vargas",
      dob: "1984-01-28",
      sex: "Male",
      employeeId: "5018856",
      department: "Maintenance",
      jobTitle: "Millwright",
      createdAt,
    },
  ];
}

function signed(note: Note): Note {
  return {
    ...note,
    signature: makeSignature(
      note,
      { kind: "typed", typedName: note.author },
      note.issuedAt ?? note.serviceDate,
    ),
  };
}

function seedNotes(): Note[] {
  const today = todayIsoDate();
  const care = new Date(`${today}T13:19:10-04:00`).toISOString();
  const yesterday = addDaysIso(today, -1);
  const yCare = new Date(`${yesterday}T10:42:00-04:00`).toISOString();
  const notes: Note[] = [
    {
      id: "note_sample",
      templateId: "return-to-work",
      employeeId: "emp_hale",
      status: "issued",
      diagnosis: "Upper Respiratory Infection",
      natureOfIllness: "Upper Respiratory Infection",
      datesOfCare: care,
      returnDate: addDaysIso(today, 1),
      workStatus: "full-duty",
      comments: "",
      restrictions: "",
      absenceStart: "",
      absenceEnd: "",
      schoolName: "",
      author: "Alicia Kelley",
      authorTitle: "PSR",
      serviceDate: care,
      fin: "9154001",
      issuedAt: care,
      createdAt: care,
      updatedAt: care,
    },
    {
      id: "note_light",
      templateId: "modified-duty",
      employeeId: "emp_brooks",
      status: "issued",
      diagnosis: "Lumbar Strain",
      natureOfIllness: "Lumbar Strain",
      datesOfCare: yCare,
      returnDate: addDaysIso(today, 5),
      workStatus: "restricted",
      comments: "Re-evaluate at follow-up.",
      restrictions: "No lifting over 15 lbs. Sit or stand as tolerated. No overtime.",
      absenceStart: "",
      absenceEnd: "",
      schoolName: "",
      author: "Alicia Kelley",
      authorTitle: "PSR",
      serviceDate: yCare,
      fin: "9154002",
      issuedAt: yCare,
      createdAt: yCare,
      updatedAt: yCare,
    },
    {
      id: "note_draft",
      templateId: "return-to-work",
      employeeId: "emp_chen",
      status: "draft",
      diagnosis: "Influenza",
      natureOfIllness: "Influenza",
      datesOfCare: care,
      returnDate: addDaysIso(today, 2),
      workStatus: "off-duty",
      comments: "",
      restrictions: "",
      absenceStart: "",
      absenceEnd: "",
      schoolName: "",
      author: "Alicia Kelley",
      authorTitle: "PSR",
      serviceDate: care,
      fin: "9154003",
      createdAt: care,
      updatedAt: care,
    },
  ];
  return notes.map((n) => (n.status === "issued" ? signed(n) : n));
}

function nextFin(notes: Note[]) {
  let max = 9154000;
  for (const n of notes) {
    const v = Number.parseInt(n.fin, 10);
    if (!Number.isNaN(v) && v > max) max = v;
  }
  return String(max + 1);
}

function nextEmployeeId(employees: Employee[]) {
  let max = 5018800;
  for (const e of employees) {
    const v = Number.parseInt(e.employeeId, 10);
    if (!Number.isNaN(v) && v > max) max = v;
  }
  return String(max + 1);
}

function withOrgDefaults(org: Partial<OrgSettings> | OrgSettings): OrgSettings {
  return {
    ...defaultOrg,
    ...org,
    markColor: org.markColor ?? defaultOrg.markColor,
    requireSignature: org.requireSignature ?? defaultOrg.requireSignature,
  };
}

export type DeskState = {
  org: OrgSettings;
  employees: Employee[];
  notes: Note[];
  setOrg: (patch: Partial<OrgSettings>) => void;
  addEmployee: (input: Omit<Employee, "id" | "createdAt" | "employeeId"> & { employeeId?: string }) => Employee;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  createNote: (templateId: TemplateId, employeeId: string) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  applySignature: (id: string, signature: NoteSignature, saveMark?: boolean) => void;
  clearSignature: (id: string) => void;
  issueNote: (id: string) => boolean;
  voidNote: (id: string) => void;
  duplicateNote: (id: string) => Note | null;
  removeNote: (id: string) => void;
};

export const useDesk = create<DeskState>()(
  persist(
    (set, get) => ({
      org: defaultOrg,
      employees: seedEmployees(),
      notes: seedNotes(),
      setOrg: (patch) => set((s) => ({ org: { ...s.org, ...patch } })),
      addEmployee: (input) => {
        const employee: Employee = {
          id: uid(),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          dob: input.dob,
          sex: input.sex,
          employeeId: input.employeeId?.trim() || nextEmployeeId(get().employees),
          department: input.department.trim(),
          jobTitle: input.jobTitle.trim(),
          createdAt: nowIso(),
        };
        set((s) => ({ employees: [employee, ...s.employees] }));
        return employee;
      },
      updateEmployee: (id, patch) =>
        set((s) => ({
          employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeEmployee: (id) =>
        set((s) => ({
          employees: s.employees.filter((e) => e.id !== id),
          notes: s.notes.filter((n) => n.employeeId !== id),
        })),
      createNote: (templateId, employeeId) => {
        const template = getTemplate(templateId);
        const now = nowIso();
        const today = todayIsoDate();
        const note: Note = {
          id: uid(),
          templateId,
          employeeId,
          status: "draft",
          diagnosis: "",
          natureOfIllness: "",
          datesOfCare: now,
          returnDate: addDaysIso(today, 1),
          workStatus: template.defaultWorkStatus,
          comments: "",
          restrictions: "",
          absenceStart: today,
          absenceEnd: addDaysIso(today, 2),
          schoolName: "",
          author: get().org.defaultAuthor,
          authorTitle: get().org.defaultAuthorTitle,
          serviceDate: now,
          fin: nextFin(get().notes),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => {
            if (n.id !== id) return n;
            const next: Note = { ...n, ...patch, updatedAt: nowIso() };
            if (
              n.signature &&
              !("signature" in patch) &&
              noteFingerprint(n) !== noteFingerprint(next)
            ) {
              next.signature = undefined;
            }
            return next;
          }),
        })),
      applySignature: (id, signature, saveMark) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, signature, updatedAt: nowIso() } : n,
          ),
          org: saveMark
            ? {
                ...s.org,
                staffMark: {
                  kind: signature.kind,
                  imageDataUrl: signature.imageDataUrl,
                  typedName: signature.typedName,
                },
              }
            : s.org,
        })),
      clearSignature: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, signature: undefined, updatedAt: nowIso() } : n,
          ),
        })),
      issueNote: (id) => {
        const current = get().notes.find((n) => n.id === id);
        if (!current || current.status === "void") return false;
        if (get().org.requireSignature && !isSignatureValid(current)) return false;
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  status: "issued" as const,
                  issuedAt: n.issuedAt ?? nowIso(),
                  updatedAt: nowIso(),
                }
              : n,
          ),
        }));
        return true;
      },
      voidNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? { ...n, status: "void" as const, updatedAt: nowIso() }
              : n,
          ),
        })),
      duplicateNote: (id) => {
        const source = get().notes.find((n) => n.id === id);
        if (!source) return null;
        const now = nowIso();
        const copy: Note = {
          ...source,
          id: uid(),
          status: "draft",
          fin: nextFin(get().notes),
          serviceDate: now,
          datesOfCare: now,
          issuedAt: undefined,
          signature: undefined,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ notes: [copy, ...s.notes] }));
        return copy;
      },
      removeNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    {
      name: "dutydesk-v3",
      skipHydration: true,
      partialize: (s) => ({
        org: s.org,
        employees: s.employees,
        notes: s.notes,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<DeskState> | undefined;
        return {
          ...current,
          org: withOrgDefaults(p?.org ?? current.org),
          employees: p?.employees ?? current.employees,
          notes: p?.notes ?? current.notes,
        };
      },
    },
  ),
);
