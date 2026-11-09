import { generateMonthGrid } from '../dateUtils';

describe('generateMonthGrid', () => {
    it('labels cells with their local date', () => {
        const days = generateMonthGrid(2026, 10); // November 2026
        for (const day of days.filter(d => d.isCurrentMonth)) {
            expect(day.date).toBe(`2026-11-${String(day.display).padStart(2, '0')}`);
        }
        expect(days.filter(d => d.isCurrentMonth)).toHaveLength(30);
    });
});
