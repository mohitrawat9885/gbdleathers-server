const Cart = require("./Customer/CartModel");

const catchAsync = require(`${__dirname}/../Utils/catchAsync`);
const AppError = require(`${__dirname}/../Utils/appError`);
const APIFeatures = require(`${__dirname}/../Utils/apiFeatures`);

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
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
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log("This", req.body);
    if (req.user?._id) req.body.user = req.user._id;
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // if(req.user){
    //   this
    // }
    // console.log("Before", this);

    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);
    if (!req.user) {
      filterActive = { active: { $ne: false } };
      query.find(filterActive);
    }
    doc = await query;
    if (!doc) {
      return next(new AppError("No Doc found with that ID", 404));
    }
    if (req.body.for === "workshop") {
      doc.participants = doc.participants.filter((p) => {
        if (p.payment === "completed") return true;
        return false;
      });
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour(hack )
    let filter = {};
    if (req.params.id) filter = { t: req.params.id };
    // console.log(Model)
    // console.log("query : ", req.query)
    // console.log(req.user)

    // console.log("All Products")
    let numberOfDocs;
    if (req.user) {
      if (req?.query?.status) {
        numberOfDocs = await Model.countDocuments({ status: req.query.status });
      } else {
        numberOfDocs = await Model.countDocuments();
      }
    }
    if (!req.user) {
      numberOfDocs = await Model.countDocuments({ active: !false });
    }

    // console.log(req.query)
    // console.log("Number of field are ", numberOfDocs)

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain();
    let query = features.query;
    let filterActive;
    if (!req.user) {
      filterActive = { active: { $ne: false } };
      query.find(filterActive);
    }
    if (req.params.type) {
      // console.log(req.params.type);
      if (req.params.type == "previous") {
        query.find({ start: { $lte: new Date() } });
      } else if (req.params.type == "upcoming") {
        query.find({ end: { $gte: new Date() } });
      }
    }

    if (popOptions) query.populate(popOptions);
    if (req.body.for === "orders") {
      if (req.query.status && req.query.status !== "all") {
        query = query.find({ payment: "completed" });
      }
    }

    let doc = await query;
    if (req.body.for === "cart") {
      // let newDoc = [];
      // console.log(doc);
      doc = doc.filter(async (d) => {
        if (!d.product || Object.keys(d.product).length === 0) {
          await Cart.findByIdAndDelete(d._id);
        }
      });
    }
    if (req.body.for === "workshop") {
      for (let i = 0; i < doc.length; i++) {
        doc[i].participants = doc[i].participants.filter((p) => {
          if (p.payment === "completed") return true;
          return false;
        });
      }
    }
    res.status(201).json({
      status: "success",
      result: doc.length,
      totalDocument: numberOfDocs,
      data: doc,
    });
  });
