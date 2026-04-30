require("dotenv").config();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const S3_CONFIGURED = !!(
  process.env.S3_BUCKET_NAME &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
);

function makeStorage(prefix) {
  if (S3_CONFIGURED) {
    const multerS3 = require("multer-s3");
    const s3 = require("./s3");
    return multerS3({
      s3,
      bucket: process.env.S3_BUCKET_NAME,
      key: (req, file, cb) => cb(null, `${prefix}/${Date.now()}_${file.originalname}`),
    });
  }
  const uploadDir = path.join(__dirname, "../../uploads", prefix);
  fs.mkdirSync(uploadDir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
  });
}

const uploadUserProfile    = multer({ storage: makeStorage("users/profiles") });
const uploadUserDocument   = multer({ storage: makeStorage("users/documents") });
const uploadProjectFile    = multer({ storage: makeStorage("projects/files") });
const uploadPaymentInvoice = multer({ storage: makeStorage("payments/invoices") });
const uploadDataset        = multer({ storage: makeStorage("datasets/raw") });
const uploadAdminReport    = multer({ storage: makeStorage("admin/reports") });

module.exports = {
  uploadUserProfile,
  uploadUserDocument,
  uploadProjectFile,
  uploadPaymentInvoice,
  uploadDataset,
  uploadAdminReport,
};
