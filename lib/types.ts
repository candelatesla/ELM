export type DomainId =
  | "language-literacy"
  | "mathematics"
  | "self-regulation"
  | "social-emotional"
  | "social-studies"
  | "creative-expression"
  | "science"
  | "physical-health";

export type FieldType =
  | "date"
  | "text"
  | "textarea"
  | "number"
  | "score"
  | "select"
  | "checkbox";

export type FieldOption = {
  label: string;
  value: string;
};

export type AssessmentFieldConfig = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  helpText?: string;
};

export type SkillConfig = {
  id: string;
  title: string;
  description?: string;
  groupTitle?: string;
  groupNote?: string;
  fields?: AssessmentFieldConfig[];
};

export type AssessmentConfig = {
  id: string;
  title: string;
  week: number;
  description: string;
  fields: AssessmentFieldConfig[];
};

export type DomainConfig = {
  id: DomainId;
  title: string;
  shortDescription: string;
  skills: SkillConfig[];
  assessments?: AssessmentConfig[];
};

export type BasicInfo = {
  state: string;
  teacherName: string;
  schoolName: string;
  classroomName: string;
  childName: string;
};

export type SkillEntry = Record<string, string | boolean>;
export type DomainEntry = {
  skills: Record<string, SkillEntry>;
  assessments: Record<string, SkillEntry>;
};

export type SubmissionPayload = {
  basicInfo: BasicInfo;
  selectedDomains: DomainId[];
  entries: Record<string, DomainEntry>;
  uploadedFiles: Array<{ name: string; status: "planned"; note: string }>;
  submittedAt?: string;
};
