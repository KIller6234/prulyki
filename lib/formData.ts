/** Collects only non-empty string fields from FormData (skips File entries). */
export function formDataToStringRecord(
  formData: FormData,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value !== "") {
      result[key] = value;
    }
  }
  return result;
}
