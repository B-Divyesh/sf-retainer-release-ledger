export function safeCsvCell(value: string | number): string {
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function rowsToCsv(rows: Array<Array<string | number>>): string {
  return rows.map((row) => row.map(safeCsvCell).join(',')).join('\r\n');
}
