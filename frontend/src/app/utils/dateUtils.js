// src/utils/dateUtils.js

// Format a Date as "YYYY-MM-DD" in the user's local time zone.
// (toISOString() would use UTC, shifting dates by a day east of UTC, e.g. India.)
export function toLocalDateString(d) {
 const pad = (n) => String(n).padStart(2, '0');
 return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function generateMonthGrid(year, month) {
 const firstDay = new Date(year, month, 1);
 const lastDay = new Date(year, month + 1, 0);
 const daysInMonth = lastDay.getDate();
 const startDay = firstDay.getDay(); // 0 (Sun) – 6 (Sat)
 const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
 const days = [];
 for (let i = 0; i < totalCells; i++) {
   const day = new Date(year, month, i - startDay + 1);
   const isCurrentMonth = day.getMonth() === month;
   days.push({
     date: toLocalDateString(day), // "YYYY-MM-DD" in local time
     display: day.getDate(),
     isCurrentMonth
   });
 }
 return days;
}