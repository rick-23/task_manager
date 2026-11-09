export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const WEEK_DAYS = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];

// Reminder lead times offered in the task form (minutes before the task's time).
export const REMINDER_OPTIONS = [
    { value: "", label: "No reminder" },
    { value: "0", label: "At the time" },
    { value: "5", label: "5 minutes before" },
    { value: "15", label: "15 minutes before" },
    { value: "30", label: "30 minutes before" },
    { value: "60", label: "1 hour before" },
    { value: "120", label: "2 hours before" },
    { value: "1440", label: "1 day before" },
];

export const reminderLabel = (minutes) => {
    if (minutes === null || minutes === undefined || minutes === "") return "No reminder";
    const option = REMINDER_OPTIONS.find((o) => o.value === String(minutes));
    return option ? option.label : `${minutes} minutes before`;
};
