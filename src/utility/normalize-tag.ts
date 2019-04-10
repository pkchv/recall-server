
export function normalizeTag(tag: string) {
  return tag
    .normalize()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s/g, "-");
}
