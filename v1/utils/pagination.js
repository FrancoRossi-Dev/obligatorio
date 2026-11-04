// Newest first, with _id breaking ties so skip() never repeats or drops a document between pages.
// populate (optional) is passed straight to Mongoose's query.populate()
export const paginate = async (Model, filter, { page, limit }, { populate } = {}) => {
  const query = Model.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  if (populate) query.populate(populate);

  const [data, total] = await Promise.all([
    query,
    Model.countDocuments(filter),
  ]);
  return { data, total, page, limit, pages: Math.ceil(total / limit) };
};
