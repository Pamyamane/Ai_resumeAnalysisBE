const ResumeAnalysis = require("../models/resumeAnalysis.model");
const { analyzeResume, parseResumeFile } = require("../services/resume.service");
const { createResumePdf } = require("../services/pdf.service");

function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

const analyzeResumeController = async (req, res) => {
  try {
    const { jobDescription, targetRole } = req.body;

    if (!jobDescription?.trim()) {
      return res.status(400).json({ message: "Job description is required." });
    }

    const resumeText = await parseResumeFile(req.file);
    const analysis = analyzeResume({ resumeText, jobDescription: jobDescription.trim(), targetRole: targetRole?.trim() });

    const saved = await ResumeAnalysis.create({
      user: req.user.userId,
      resumeFileName: req.file.originalname,
      targetRole: targetRole?.trim(),
      jobDescription: jobDescription.trim(),
      resumeText,
      ...analysis,
    });

    res.status(201).json({
      message: "Resume analyzed successfully.",
      analysis: saved,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Resume analysis failed." });
  }
};

const getResumeAnalysesController = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(25)
      .select("-resumeText -jobDescription");

    res.status(200).json({ analyses });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not load analyses." });
  }
};

const downloadAtsResumeController = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid analysis id." });
    }

    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    if (!analysis.atsResume?.summary) {
      return res.status(400).json({ message: "Optimized resume is not available for this analysis." });
    }

    const pdf = await createResumePdf(analysis.atsResume);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ats-resume-${analysis._id}.pdf"`);
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ message: err.message || "PDF generation failed." });
  }
};

module.exports = {
  analyzeResumeController,
  getResumeAnalysesController,
  downloadAtsResumeController,
};
