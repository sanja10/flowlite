export const TEMPLATES = [
  {
    key: "personal",
    name: "Personal",
    defaultStuckDays: 3,
    statuses: [
      { name: "Backlog", order: 1, isDone: false },
      { name: "Today", order: 2, isDone: false },
      { name: "In progress", order: 3, isDone: false },
      { name: "Blocked", order: 4, isDone: false },
      { name: "Done", order: 5, isDone: true }
    ]
  }
] as const;
