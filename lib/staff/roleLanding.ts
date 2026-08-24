/** Сторінка "кабінету" за замовчуванням для кожної ролі співробітника. */
export const ROLE_LANDING_PATH: Record<string, string> = {
  ADMIN: "/staff/personnel",
  DISPATCHER: "/staff/panel",
  INSPECTOR: "/staff/tasks",
};

export function roleLandingPath(role: string): string {
  return ROLE_LANDING_PATH[role] ?? "/staff/login";
}
