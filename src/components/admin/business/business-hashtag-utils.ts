export function normalizeHashtags(values: string[]) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(/[\s,]+/))
        .map((value) => value.trim().replace(/^#+/, ""))
        .filter(Boolean),
    ),
  );
}
