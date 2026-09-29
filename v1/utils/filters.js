// Query-string text is matched literally: escaping it keeps user input from running as a regex
// (e.g. "(" would throw, and nested quantifiers could hang the query)
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const equalsIgnoreCase = (text) => ({ $regex: `^${escapeRegex(text)}$`, $options: 'i' });

export const containsText = (text) => ({ $regex: escapeRegex(text), $options: 'i' });

// Adds each condition to the one already on the field, so filters on the same field narrow it
// together instead of replacing each other (e.g. an advisor's own clientIds plus a requested clientId)
export const addCondition = (filter, field, condition) => {
  filter[field] = { ...filter[field], ...condition };
  return filter;
};
