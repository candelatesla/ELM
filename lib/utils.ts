import { DomainConfig, DomainEntry, FieldType, SubmissionPayload } from "@/lib/types";

export function createEmptyDomainEntry(domain: DomainConfig): DomainEntry {
  return {
    skills: Object.fromEntries(
      domain.skills.map((skill) => [
        skill.id,
        Object.fromEntries((skill.fields ?? []).map((field) => [field.id, field.type === "checkbox" ? false : ""])),
      ]),
    ),
    assessments: Object.fromEntries(
      (domain.assessments ?? []).map((assessment) => [
        assessment.id,
        Object.fromEntries(
          assessment.fields.map((field) => [field.id, field.type === "checkbox" ? false : ""]),
        ),
      ]),
    ),
  };
}

export function getFieldDefaultValue(type: FieldType) {
  return type === "checkbox" ? false : "";
}

export function countCompletedFields(payload: SubmissionPayload) {
  let filled = 0;
  let total = 0;

  Object.values(payload.basicInfo).forEach((value) => {
    total += 1;
    if (value) {
      filled += 1;
    }
  });

  payload.selectedDomains.forEach((domainId) => {
    const entry = payload.entries[domainId];

    Object.values(entry?.skills ?? {}).forEach((skill) => {
      Object.values(skill).forEach((value) => {
        total += 1;
        if (value !== "" && value !== false) {
          filled += 1;
        }
      });
    });

    Object.values(entry?.assessments ?? {}).forEach((assessment) => {
      Object.values(assessment).forEach((value) => {
        total += 1;
        if (value !== "" && value !== false) {
          filled += 1;
        }
      });
    });
  });

  return { filled, total, percent: total === 0 ? 0 : Math.round((filled / total) * 100) };
}
