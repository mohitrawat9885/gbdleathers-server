const multer = require("multer");
multer({
  limits: { fieldSize: 25 * 1024 * 1024 },
});

const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "./client/assets/images");
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

exports.uploadImage = async (req, res) => {
  try {
    let upload = multer({ storage: Storage }).single("photo");
    upload(req, res, function (err) {
      if (!req.file) {
        res.status(404).json({
          status: "failed",
          message: "No Image found!",
        });
      } else if (err instanceof multer.MulterError) {
        res.status(400).json({
          status: "error",
          message: "Internel Server Error",
          error: err,
        });
      } else if (err) {
        res.status(400).json({
          status: "error",
          message: "Internel Server Error",
          error: err,
        });
      }
      res.status(200).json({
        status: "success",
        message: "Image Uploaded Successfully",
        image: req.file.path,
        imageName: req.file.filename,
      });
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Internel Server Error",
      error: err,
    });
  }
};
