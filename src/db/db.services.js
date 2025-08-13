export const find = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => await model.find(filter).select(select).populate(populate);
export const findOne = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => await model.findOne(filter).select(select).populate(populate);
export const findById = async ({
  model,
  id,
  select = "",
  populate = [],
} = {}) => await model.findById(id).select(select).populate(populate);
export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
} = {}) => await model.create(data, options);
export const updateById = async ({
  model,
  id,
  data,
  options = { runValidators: true, new: true },
} = {}) => await model.findByIdAndUpdate(id, data, options);
export const deleteById = async ({ model, id, options = {} } = {}) =>
  await model.findByIdAndDelete(id, options);
export const updateOne = async ({
  model,
  filter,
  data,
  options = { runValidators: true, new: true },
} = {}) => await model.findOneAndUpdate(filter, data, options);
export const deleteMany = async ({ model, filter, options = {} } = {}) =>
  await model.deleteMany(filter, options);
