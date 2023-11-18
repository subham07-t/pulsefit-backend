const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const imageDimension = require("image-size");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const s3Bucket = new AWS.S3({
  params: {
    Bucket: process.env.AWS_BUCKET_NAME,
  },
});

const uploads3 = multer({
  storage: multerS3({
    s3: s3Bucket,
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, `${Date.now()}`); //use Date.now() for unique file keys
    },
  }),
});

const s3BucketToStoreExcel = "programsurlstorage";

const s3ClientExcelStore = new AWS.S3();

const uploadExcelS3 = multer({
  storage: multerS3({
    s3: s3ClientExcelStore,
    bucket: s3BucketToStoreExcel,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "_" + Date.now() + path.extname(file.originalname)
      );
    },
  }),
});

const sendAwsEmail = async (subject, emailAddress, htmlToSend) => {
  let params = {
    Source: " pulse.fit <support@pulse.fit>",
    Destination: {
      ToAddresses: emailAddress,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlToSend,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  };
  var sendPromise = new AWS.SES().sendEmail(params).promise();
  sendPromise
    .then(function (data) {
      console.log("aws response", data);
      return data;
    })
    .catch(function (err) {
      console.error("error", err, err.stack);
      return err;
    });
};

module.exports = {
  uploads3,
  s3Bucket,
  s3BucketToStoreExcel,
  uploadExcelS3,
  imageDimension,
  multer,
  sendAwsEmail,
};
