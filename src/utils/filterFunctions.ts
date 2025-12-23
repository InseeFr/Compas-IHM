export function filteredColumns<
  U,
  K extends keyof U
>(data: U[], key: K): string[] {
  const set = new Set<string>();

  for (const item of data) {
    const value = item[key];
    if (typeof value === "string" && value !== "") {
      set.add(value);
    }
  }

  return Array.from(set);
}
