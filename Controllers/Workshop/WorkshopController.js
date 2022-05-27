const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("../HandlerFactory");
const catchAsync = require("../../Utils/catchAsync");
const AppError = require("../../Utils/appError");
const Workshops = require("./WorkshopModel");
const Participants = require("./ParticipantModel");
const paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadWorkshopImages = upload.fields([
  { name: "banner", maxCount: 1 },
  { name: "images" },
]);

exports.resizeWorkshopImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  if (req.files.banner) {
    req.body.banner = `workshop-banner-${Date.now()}-${
      req.user._id
    }-${Date.now()}.jpeg`;
    await sharp(req.files.banner[0].buffer)
      .resize(1200, 1200)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`public/images/${req.body.banner}`);
  }

  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `workshop-images-${req.params.id}-${Date.now()}-${
          i + 1
        }.jpeg`;
        await sharp(file.buffer)
          .resize(1200, 1200)
          .toFormat("jpeg")
          .jpeg({ quality: 100 })
          .toFile(`public/images/${filename}`);
        req.body.images.push(filename);
      })
    );
  }
  next();
});

exports.preCreateWorkshop = catchAsync(async (req, res, next) => {
  for (let i in req.body.days) {
    req.body.days[i] = JSON.parse(req.body.days[i]);
    // console.log(req.body.days[i]);
  }
  req.body.start = req.body.days[0].start;
  req.body.end = req.body.days[req.body.days.length - 1].end;
  // console.log(req.body.days);

  next();
});
exports.createWorkshop = factory.createOne(Workshops);

exports.getAllWorkshops = factory.getAll(Workshops, { path: "participants" });


exports.getWorkshop = factory.getOne(Workshops, { path: "participants" });


exports.getClientWorkshop = factory.getAll(Workshops);
// , { path: "participants" }

exports.updateWorkshop = factory.updateOne(Workshops);

exports.removeWorkshop = factory.deleteOne(Workshops);

exports.addWorkshopImages = catchAsync(async (req, res, next) => {
  let doc = await Workshops.findByIdAndUpdate(
    req.params.id,
    {
      $push: { images: req.body.images },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!doc) {
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc.images ? doc.images : [],
    },
  });
});
exports.getWorkshopImages = catchAsync(async (req, res, next) => {
  let doc = await Workshops.findOne({ _id: req.params.id });
  if (!doc) {
    doc = await Variants.findOne({ _id: req.params.id });
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc.images ? doc.images : [],
    },
  });
});
exports.removeWorkshopImage = catchAsync(async (req, res, next) => {
  let doc = await Workshops.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { images: req.params.image },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!doc) {
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc.images,
    },
  });
});

// exports.createParticipant = factory.createOne(Participants);

exports.createParticipantData = catchAsync(async (req, res, next) => {
  const workshop = await Workshops.findById(req.body.workshop);
  console.log(workshop);
  if (!workshop) {
    return next(new AppError("Invalid Workshop Id.", 404));
  }
  if (workshop.active === false) {
    return next(new AppError("This Workshop is not active now", 404));
  }
  const participants = await Participants.find({ workshop: req.body.workshop });
  if (participants.length >= workshop.limit) {
    return next(new AppError("No seat available for this workshop!", 404));
  }
  const WorkshopTime = new Date(workshop.start);
  const nowTime = Date.now();
  if (WorkshopTime < nowTime) {
    return next(new AppError("This workshop is expired", 404));
  }

  let order = {
    participant: {
      name: req.body.name,
      email: req.body.email,
      number: req.body.number,
      workshop: req.body.workshop,
      total_cost: {
        value: workshop.price,
        currency: "USD",
      },
      payment: "pending",
      paymentId: "",
      payerId: "",
      created_at: Date.now(),
    },
    workshop: {
      name: workshop.name,
      description: workshop.description,
      total_cost: {
        value: workshop.price,
        currency: "USD",
      },
    },
  };
  req.order = order;
  console.log(order);
  next();
});

exports.getParticipantSession = catchAsync(async (req, res, next) => {
  const order = req.order;

  const payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `${req.protocol}://${req.get("host")}/workshop-success`,
      cancel_url: `${req.protocol}://${req.get("host")}/workshops/upcoming`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: order.workshop.name,
              description: order.workshop.description,
              quantity: 1,
              price: order.workshop.total_cost.value,
              currency: order.workshop.total_cost.currency,
            },
          ],
        },
        amount: {
          currency: order.workshop.total_cost.currency,
          total: order.workshop.total_cost.value,
          details: {
            shipping: "0", //transport
            // subtotal: "10", // sous total
            shipping_discount: "0.00", //reduction transport
            insurance: "0.00", // assurance
            handling_fee: "0.00", // frais de gestion
            // tax: "0.00", // tax
          },
        },
        // description: "Hat for the best team ever",
        payment_options: {
          allowed_payment_method: "IMMEDIATE_PAY",
        },
      },
    ],
  };

  paypal.payment.create(payment_json, function (error, payment) {
    if (error) {
      // console.log("Paypal Error", error.response);
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          req.order.participant.paymentId = payment.id;
          Participants.create(req.order.participant);
          res.status(201).json({
            status: "success",
            payment_url: payment.links[i].href,
          });
        }
      }
    }
  });
});

exports.paymentSuccess = async (req, res) => {
  var paymentId = req.query.paymentId;
  var payerId = { payer_id: req.query.PayerID };

  paypal.payment.execute(paymentId, payerId, async function (error, payment) {
    if (error) {
      console.error(JSON.stringify(error));
    } else {
      if (payment.state == "approved") {
        // setSuccessOrderData(paymentId, payerId.payer_id);
        console.log("Payment Done");
        await Participants.findOneAndUpdate(
          { paymentId: paymentId },
          {
            payment: "completed",
            payerId: payerId.payer_id,
            created_at: Date.now(),
          }
        );
        res.status(201).json({
          status: "success",
          payment: payment,
        });
      } else {
        console.log("Payment Not done");
        res.status(400).json({
          status: "payment not successful",
          payment: {},
        });
      }
    }
  });
};

exports.getAllParticipants = factory.getAll(Participants);
exports.getParticipant = factory.getOne(Participants);
exports.updateParticipant = factory.updateOne(Participants);
exports.removeParticipant = factory.deleteOne(Participants);
