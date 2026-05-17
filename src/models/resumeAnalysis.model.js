const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeFileName: String,
    targetRole: String,
    jobDescription: String,
    resumeText: String,
    extractedSkills: [String],
    jobSkills: [String],
    matchedSkills: [String],
    missingSkills: [String],
    recommendations: [String],
    interviewQuestions: [String],
    coverLetter: String,
    recruiterPitch: String,
    learningRoadmap: [
      {
        week: String,
        focus: String,
        tasks: [String],
      },
    ],
    projectIdeas: [
      {
        title: String,
        description: String,
        skills: [String],
      },
    ],
    keywordInsights: [
      {
        keyword: String,
        status: String,
        priority: String,
      },
    ],
    applicationChecklist: [String],
    atsBreakdown: [
      {
        label: String,
        score: Number,
        feedback: String,
      },
    ],
    semanticMatches: [
      {
        requirement: String,
        evidence: String,
        strength: String,
      },
    ],
    bulletRewrites: [
      {
        original: String,
        optimized: String,
      },
    ],
    linkedinProfile: {
      headline: String,
      about: String,
      featuredItems: [String],
    },
    coldEmail: String,
    applicationTracker: [
      {
        stage: String,
        status: String,
        nextAction: String,
      },
    ],
    atsResume: {
      name: String,
      title: String,
      summary: String,
      skills: [String],
      experienceBullets: [String],
      projects: [String],
    },
    atsScore: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
