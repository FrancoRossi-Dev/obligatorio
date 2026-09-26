export const monthOf = (date) => date.toISOString().slice(0, 7);

export const currentMonthFilter = () => {
  const now = new Date();
  return {
    $gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    $lt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
  };
};
