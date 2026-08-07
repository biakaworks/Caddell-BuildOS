// Centralized date formatting for CG&M BuildOS.
//
// All fixture dates are plain date strings (e.g. "2027-06-01"), which JS parses
// as UTC midnight. Formatting them in the runtime's local timezone makes the
// server (UTC) and a US-timezone browser disagree by a day/month, causing React
// hydration mismatches. Pinning timeZone: "UTC" guarantees identical output on
// server and client.

export function fmtDate(
  input: string | number | Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(input).toLocaleDateString("en-US", { ...options, timeZone: "UTC" })
}

export function fmtDateTime(
  input: string | number | Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(input).toLocaleString("en-US", { ...options, timeZone: "UTC" })
}
