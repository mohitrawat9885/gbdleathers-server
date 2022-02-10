const catchAsync = require(`${__dirname}/../Utils/catchAsync`);
const AppError = require(`${__dirname}/../Utils/appError`);
const APIFeatures = require(`${__dirname}/../Utils/apiFeatures`);

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No Doc found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour(hack )

    let filter = {};
    if (req.params.id) filter = { t: req.params.id };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .skip();

    // const doc = await features.query.explain();
    let query = features.query;
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    res.status(201).json({
      status: 'success',
      result: doc.length,
      data: doc,
    });
  });
