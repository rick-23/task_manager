// src/utils/dateUtils.js
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
     date: day.toISOString().split('T')[0], // "YYYY-MM-DD"
     display: day.getDate(),
     isCurrentMonth
   });
 }
 return days;
}