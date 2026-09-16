export type Sex = "Female" | "Male" | "Other" | "Undisclosed";

export type WorkStatus = "full-duty" | "light-duty" | "off-duty" | "restricted";

export type NoteStatus = "draft" | "issued" | "void";

export type MarkColor = "teal" | "navy" | "forest";

export type SignatureKind = "drawn" | "typed";

export type TemplateId =
  | "return-to-work"
  | "return-to-school"
  | "work-status"
  | "absence"
  | "fit-for-duty"
  | "modified-duty"
  | "visit-confirm"
  | "leave";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  sex: Sex;
  employeeId: string;
  department: string;
  jobTitle: string;
  createdAt: string;
};

export type StaffMark = {
  kind: SignatureKind;
  imageDataUrl?: string;
  typedName?: string;
};

export type OrgSettings = {
  name: string;
  markLine1: string;
  markLine2: string;
  markColor: MarkColor;
  location: string;
  address: string;
  phone: string;
  defaultAuthor: string;
  defaultAuthorTitle: string;
  visitType: string;
  requireSignature: boolean;
  staffMark?: StaffMark;
};

export type NoteSignature = {
  kind: SignatureKind;
  imageDataUrl?: string;
  typedName?: string;
  signedAt: string;
  signerName: string;
  signerTitle: string;
  fingerprint: string;
};

export type Note = {
  id: string;
  templateId: TemplateId;
  employeeId: string;
  status: NoteStatus;
  diagnosis: string;
  natureOfIllness: string;
  datesOfCare: string;
  returnDate: string;
  workStatus: WorkStatus | "";
  comments: string;
  restrictions: string;
  absenceStart: string;
  absenceEnd: string;
  schoolName: string;
  author: string;
  authorTitle: string;
  serviceDate: string;
  fin: string;
  signature?: NoteSignature;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TemplateField =
  | "diagnosis"
  | "datesOfCare"
  | "returnDate"
  | "nature"
  | "workStatus"
  | "comments"
  | "restrictions"
  | "absence"
  | "schoolName";

export type NoteTemplate = {
  id: TemplateId;
  title: string;
  short: string;
  description: string;
  headerType: string;
  category: "Work" | "School" | "Leave";
  fields: TemplateField[];
  defaultWorkStatus: WorkStatus | "";
};
