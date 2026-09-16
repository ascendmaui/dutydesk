import type { NoteStatus, NoteTemplate, TemplateId, WorkStatus } from "./types";

export const TEMPLATES: NoteTemplate[] = [
  {
    id: "return-to-work",
    title: "Return to Work/School Waiver",
    short: "Return to work",
    description: "Release an employee back to duty after illness or injury.",
    headerType: "Work/School Note",
    category: "Work",
    fields: ["diagnosis", "datesOfCare", "returnDate", "nature", "workStatus", "comments"],
    defaultWorkStatus: "full-duty",
  },
  {
    id: "return-to-school",
    title: "Return to School Waiver",
    short: "Return to school",
    description: "Excuse and release a student back to class.",
    headerType: "Work/School Note",
    category: "School",
    fields: [
      "schoolName",
      "diagnosis",
      "datesOfCare",
      "returnDate",
      "nature",
      "comments",
    ],
    defaultWorkStatus: "",
  },
  {
    id: "work-status",
    title: "Work Status Update",
    short: "Work status",
    description: "Current duty status, with or without restrictions.",
    headerType: "Work Status Note",
    category: "Work",
    fields: [
      "diagnosis",
      "datesOfCare",
      "returnDate",
      "nature",
      "workStatus",
      "restrictions",
      "comments",
    ],
    defaultWorkStatus: "light-duty",
  },
  {
    id: "fit-for-duty",
    title: "Fit for Duty",
    short: "Fit for duty",
    description: "Cleared to work full duty with no restrictions.",
    headerType: "Fit for Duty Note",
    category: "Work",
    fields: ["diagnosis", "datesOfCare", "returnDate", "nature", "workStatus", "comments"],
    defaultWorkStatus: "full-duty",
  },
  {
    id: "modified-duty",
    title: "Modified Duty Release",
    short: "Modified duty",
    description: "Return with lifting, standing, or hour restrictions.",
    headerType: "Work Status Note",
    category: "Work",
    fields: [
      "diagnosis",
      "datesOfCare",
      "returnDate",
      "nature",
      "workStatus",
      "restrictions",
      "comments",
    ],
    defaultWorkStatus: "restricted",
  },
  {
    id: "absence",
    title: "Absence Excuse",
    short: "Absence excuse",
    description: "Document days the employee was unable to work.",
    headerType: "Work/School Note",
    category: "Leave",
    fields: ["diagnosis", "datesOfCare", "absence", "nature", "workStatus", "comments"],
    defaultWorkStatus: "off-duty",
  },
  {
    id: "leave",
    title: "Leave of Absence",
    short: "Leave of absence",
    description: "Extended leave dates and expected return.",
    headerType: "Leave Note",
    category: "Leave",
    fields: [
      "diagnosis",
      "datesOfCare",
      "absence",
      "returnDate",
      "nature",
      "workStatus",
      "comments",
    ],
    defaultWorkStatus: "off-duty",
  },
  {
    id: "visit-confirm",
    title: "Visit Confirmation",
    short: "Visit confirmation",
    description: "Confirm the employee was seen and may return.",
    headerType: "Work/School Note",
    category: "Work",
    fields: ["diagnosis", "datesOfCare", "returnDate", "nature", "workStatus", "comments"],
    defaultWorkStatus: "full-duty",
  },
];

export function getTemplate(id: TemplateId) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}

export const WORK_STATUS_LABEL: Record<WorkStatus, string> = {
  "full-duty": "Full Duty",
  "light-duty": "Light Duty",
  "off-duty": "Off Duty",
  restricted: "Restricted Duty",
};

export const WORK_STATUS_OPTIONS: WorkStatus[] = [
  "full-duty",
  "light-duty",
  "restricted",
  "off-duty",
];

export function statusLabel(status: NoteStatus) {
  if (status === "issued") return "Issued";
  if (status === "void") return "Void";
  return "Draft";
}

export function statusBadgeVariant(status: NoteStatus) {
  if (status === "issued") return "issued" as const;
  if (status === "void") return "void" as const;
  return "draft" as const;
}
