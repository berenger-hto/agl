export function formatDate(date: Date): string {
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ]
        .map(a => a.toString().padStart(2, "0"))
        .toString()
        .split(",")
        .join("-")
}