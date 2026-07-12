/**
 * Best-effort extraction of a JSON object/array from an AI text response
 * that may be wrapped in markdown fences or surrounding prose.
 */
export function extractJSON(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.search(/[[{]/);
    if (start === -1) return null;
    const opening = cleaned[start];
    const closing = opening === "{" ? "}" : "]";
    const end = cleaned.lastIndexOf(closing);
    if (end === -1) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
