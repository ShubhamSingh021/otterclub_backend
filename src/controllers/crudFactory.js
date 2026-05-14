const buildQueryMeta = (page, limit, totalItems) => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit) || 1,
});

export const createCrudController = (Model, options = {}) => {
  const {
    defaultSort = "-updatedAt",
    baseFilter = {},
    select = "",
    listTransform,
  } = options;

  return {
    list: async (req, res) => {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      const skip = (page - 1) * limit;

      const [totalItems, rawItems] = await Promise.all([
        Model.countDocuments(baseFilter),
        Model.find(baseFilter)
          .sort(defaultSort)
          .select(select)
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

      const items = listTransform ? rawItems.map(listTransform) : rawItems;

      res.status(200).json({
        success: true,
        data: items,
        meta: buildQueryMeta(page, limit, totalItems),
      });
    },

    getById: async (req, res) => {
      const item = await Model.findById(req.params.id).select(select).lean();
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${Model.modelName} not found`,
        });
      }

      res.status(200).json({ success: true, data: item });
    },

    create: async (req, res) => {
      const item = await Model.create(req.body);
      res.status(201).json({ success: true, data: item });
    },

    updateById: async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        returnDocument: "after",
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${Model.modelName} not found`,
        });
      }

      res.status(200).json({ success: true, data: item });
    },

    deleteById: async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${Model.modelName} not found`,
        });
      }

      res.status(200).json({
        success: true,
        message: `${Model.modelName} deleted successfully`,
      });
    },
  };
};
