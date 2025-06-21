export function canAssignTask(
  orgChart: any,
  departmentId: string,
  assignerRole: string,
  assigneeRole: string
): boolean {
  const dept = orgChart.departments.find((d: any) => d.id === departmentId);
  if (!dept) return false;

  let assignerLevel = -1;
  let assigneeLevel = -1;

  dept.levels.forEach((level: any, idx: number) => {
    if (level.roles.includes(assignerRole)) assignerLevel = idx;
    if (level.roles.includes(assigneeRole)) assigneeLevel = idx;
  });

  // Assigner must be in a higher (lower index) level than assignee
  return assignerLevel !== -1 && assigneeLevel !== -1 && assignerLevel < assigneeLevel;
}