// Newest first, with _id breaking ties so skip() never repeats or drops a document between pages
export const paginate = async (Model, filter, { page, limit }) => {
  const [data, total] = await Promise.all([
    Model.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Model.countDocuments(filter),
  ]);
  return { data, total, page, limit, pages: Math.ceil(total / limit) };
};
