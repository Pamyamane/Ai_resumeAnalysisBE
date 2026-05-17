const express = require("express");
const multer = require("multer");

const { authMiddleware } = require("../middleware/auth.middleware");
const {
  analyzeResumeController,
  downloadAtsResumeController,
  getResumeAnalysesController,
} = require("../controllers/resume.controller");

const resumeRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "text/plain"];
    const allowedExtensions = /\.(pdf|txt)$/i;
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.test(file.originalname)) {
      return cb(null, true);
    }
    cb(new Error("Only PDF and text resumes are supported."));
  },
});

const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Resume file must be 5MB or smaller." : err.message;
      return res.status(400).json({ message });
    }

    return res.status(400).json({ message: err.message || "Resume upload failed." });
  });
};

resumeRouter.use(authMiddleware);

resumeRouter.post("/analyze", uploadResume, analyzeResumeController);
resumeRouter.get("/analyses", getResumeAnalysesController);
resumeRouter.get("/analyses/:id/pdf", downloadAtsResumeController);

module.exports = resumeRouter;
