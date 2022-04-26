const mongoose = require("mongoose");
const factory = require("../HandlerFactory");
// const catchAsync = require("../../Utils/catchAsync");
// const AppError = require("../../Utils/appError");
const ContactUs = require("./ContactUsModel");

exports.createContactUs = factory.createOne(ContactUs);
exports.getAllContactUs = factory.getAll(ContactUs);
// exports.getParticipant = factory.getOne(Participants);
// exports.updateParticipant = factory.updateOne(Participants);
exports.deleteContactUs = factory.deleteOne(ContactUs);
