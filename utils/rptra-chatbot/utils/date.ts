// export function formatDate(dateString: string) {
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return "Invalid date";
//   return date.toLocaleString(undefined, {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }
// export function parseDateTimeToISO(date: string, time: string) {
//   const combined = new Date(`${date}T${time}`);
//   if (isNaN(combined.getTime())) return null;
//   return combined.toISOString();
// }