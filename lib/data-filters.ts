/** Exclude demo seed records from production stats and summaries. */
export function excludeDemoRecords<T extends { is_demo?: boolean }>(rows: T[]): T[] {
  return rows.filter((row) => !row.is_demo);
}
