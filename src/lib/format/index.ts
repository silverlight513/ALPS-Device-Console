export const UNAVAILABLE = 'Unavailable'

// NOTE: This is extracted for testability and reusability. Just noting this as an example.
export const formatDate = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleString() : UNAVAILABLE
