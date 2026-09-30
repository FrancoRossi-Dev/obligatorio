export const monthOf = (date) => date.toISOString().slice(0, 7);

export const toIsoDate = (date) => date.toISOString().slice(0, 10);

export const daysAgo = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

export const nextDay = (date) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
};
