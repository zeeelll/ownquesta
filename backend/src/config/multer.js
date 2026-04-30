require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./s3");

const uploadUserProfile = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `users/profiles/${Date.now()}_${file.originalname}`);
    },
  }),
});

const uploadUserDocument = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `users/documents/${Date.now()}_${file.originalname}`);
    },
  }),
});

const uploadProjectFile = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `projects/files/${Date.now()}_${file.originalname}`);
    },
  }),
});

const uploadPaymentInvoice = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `payments/invoices/${Date.now()}_${file.originalname}`);
    },
  }),
});

const uploadDataset = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `datasets/raw/${Date.now()}_${file.originalname}`);
    },
  }),
});

const uploadAdminReport = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `admin/reports/${Date.now()}_${file.originalname}`);
    },
  }),
});

module.exports = {
  uploadUserProfile,
  uploadUserDocument,
  uploadProjectFile,
  uploadPaymentInvoice,
  uploadDataset,
  uploadAdminReport,
};
