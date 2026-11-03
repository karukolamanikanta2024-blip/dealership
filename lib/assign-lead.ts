export type AssignmentRuleInput = {
  showroomId: number;
  carModelId: number | null; // null = handles every model at this showroom
  consultantId: number;
};

export function pickConsultant(
  rules: AssignmentRuleInput[],
  showroomId: number,
  carModelId: number | null
): number | null {
  const atShowroom = rules.filter((r) => r.showroomId === showroomId);

  if (carModelId !== null) {
    const specific = atShowroom.find((r) => r.carModelId === carModelId);
    if (specific) return specific.consultantId;
  }

  const general = atShowroom.find((r) => r.carModelId === null);
  return general ? general.consultantId : null;
}