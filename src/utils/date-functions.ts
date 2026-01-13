export function isDateOlderThan31Days(dateStr?: string | null): boolean {
    if (!dateStr) return false;

    const inputDate = new Date(dateStr);
    if (Number.isNaN(inputDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffInMs = today.getTime() - inputDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays > 31;
}
