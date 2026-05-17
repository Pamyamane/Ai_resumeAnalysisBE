const pdfParse = require("pdf-parse-fork");

const skillDictionary = [
  "javascript", "typescript", "react", "redux", "next.js", "node.js",
  "express", "mongodb", "mongoose", "sql", "postgresql", "mysql",
  "python", "java", "c++", "html", "css", "sass", "tailwind", "git",
  "github", "docker", "kubernetes", "aws", "azure", "gcp", "rest api",
  "graphql", "jwt", "oauth", "machine learning", "deep learning", "nlp",
  "generative ai", "openai", "langchain", "rag", "prompt engineering",
  "data analysis", "pandas", "numpy", "tensorflow", "pytorch",
  "communication", "leadership", "problem solving", "agile", "scrum",
  "testing", "jest", "vite", "puppeteer",
];

const titleKeywords = [
  "frontend developer", "backend developer", "full stack developer",
  "mern stack developer", "ai engineer", "machine learning engineer",
  "data analyst", "software engineer",
];

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeInput(value = "", maxLength = 20000) {
  return normalizeText(String(value)).slice(0, maxLength);
}

async function parseResumeFile(file) {
  if (!file) throw new Error("Resume file is required.");
  if (!file.buffer?.length) throw new Error("Uploaded resume file is empty.");

  let parsedText = "";
  const fileName = file.originalname || "";
  const isPdf = file.mimetype === "application/pdf" || /\.pdf$/i.test(fileName);
  const isText = file.mimetype.startsWith("text/") || /\.txt$/i.test(fileName);

  if (isPdf) {
    const result = await pdfParse(file.buffer);
    parsedText = result.text;
  } else if (isText) {
    parsedText = file.buffer.toString("utf8");
  } else {
    throw new Error("Only PDF and text resumes are supported.");
  }

  const normalized = normalizeInput(parsedText);
  if (normalized.length < 40) {
    throw new Error("Could not extract enough text from this resume. Please upload a text-based PDF or .txt file.");
  }
  return normalized;
}

function extractSkills(text = "") {
  const normalized = normalizeText(text).toLowerCase();
  return skillDictionary.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9+#.])${escaped}(?=$|[^a-z0-9+#.])`, "i").test(normalized);
  });
}

function calculateAtsScore({ matchedSkills, jobSkills, resumeText }) {
  const skillScore = jobSkills.length ? (matchedSkills.length / jobSkills.length) * 70 : 35;
  const structureSignals = ["experience", "education", "skills", "projects"]
    .filter((section) => resumeText.toLowerCase().includes(section)).length;
  const structureScore = (structureSignals / 4) * 20;
  const lengthScore = resumeText.length > 800 ? 10 : Math.min(10, resumeText.length / 80);
  return Math.round(Math.min(100, skillScore + structureScore + lengthScore));
}

function extractName(resumeText) {
  const firstWords = normalizeText(resumeText).split(" ").slice(0, 4).join(" ");
  if (!firstWords || /experience|education|skills|projects/i.test(firstWords)) {
    return "Your Name";
  }
  return firstWords;
}

function inferTitle(targetRole, jobDescription) {
  if (targetRole) return targetRole;
  const text = jobDescription.toLowerCase();
  return titleKeywords.find((title) => text.includes(title)) || "AI Ready Professional";
}

function buildRecommendations(missingSkills) {
  if (!missingSkills.length) {
    return ["Your resume already covers the main job-description skills. Add quantified outcomes to improve ATS ranking."];
  }
  return missingSkills.slice(0, 6).map(
    (skill) => `Add a clear project, bullet point, or certification that demonstrates ${skill}.`
  );
}

function buildInterviewQuestions({ matchedSkills, missingSkills, targetRole }) {
  const role = targetRole || "this role";
  const skillQuestions = [...matchedSkills, ...missingSkills].slice(0, 8).map(
    (skill) => `How have you used ${skill} in a real project, and what measurable result did it create?`
  );
  return [
    `Tell me about a project that proves you are ready for ${role}.`,
    ...skillQuestions,
    "Describe a time you debugged a difficult production issue.",
    "How would you explain a technical tradeoff to a non-technical stakeholder?",
  ].slice(0, 10);
}

function buildAtsResume({ resumeText, targetRole, jobDescription, matchedSkills, missingSkills }) {
  const title = inferTitle(targetRole, jobDescription);
  const importantSkills = [...new Set([...matchedSkills, ...missingSkills.slice(0, 8)])];
  return {
    name: extractName(resumeText),
    title,
    summary: `Results-focused ${title} with hands-on experience across ${matchedSkills.slice(0, 4).join(", ") || "software delivery"} and a strong focus on building reliable, user-centered solutions.`,
    skills: importantSkills,
    experienceBullets: [
      `Built and improved production features aligned with ${title} responsibilities.`,
      `Applied ${matchedSkills.slice(0, 3).join(", ") || "modern engineering practices"} to deliver maintainable and scalable solutions.`,
      "Collaborated with teams to translate requirements into measurable technical outcomes.",
      "Documented workflows, improved quality, and supported faster project delivery.",
    ],
    projects: [
      "AI Resume Analyzer: Parsed resumes, compared job descriptions, detected missing skills, and generated interview practice questions.",
      "ATS Resume Builder: Generated structured, keyword-focused resume content for target roles.",
    ],
  };
}

function buildCoverLetter({ targetRole, matchedSkills, missingSkills }) {
  const role = targetRole || "the open role";
  const strengths = matchedSkills.slice(0, 4).join(", ") || "software development, problem solving, and product thinking";
  const growth = missingSkills.slice(0, 2).join(" and ");
  return `Dear Hiring Team,\n\nI am excited to apply for ${role}. My experience with ${strengths} aligns well with your requirements, and I enjoy building practical solutions that are reliable, clear, and useful for end users.\n\nYour job description highlights ${missingSkills.length ? `additional strengths in ${growth}` : "a strong match with my current skill set"}. I am actively improving in these areas and can quickly translate new requirements into working product features.\n\nI would welcome the opportunity to discuss how my technical foundation, learning mindset, and project experience can contribute to your team.\n\nSincerely,\nYour Name`;
}

function buildRecruiterPitch({ targetRole, matchedSkills, atsScore }) {
  const role = targetRole || "software role";
  const topSkills = matchedSkills.slice(0, 5).join(", ") || "full-stack development and AI-assisted workflows";
  return `Candidate is a strong fit for a ${role}, with an ATS alignment score of ${atsScore}. Key strengths include ${topSkills}. Best positioned for teams that value practical project delivery, fast learning, and clear communication.`;
}

function buildLearningRoadmap(missingSkills) {
  const focusSkills = missingSkills.length
    ? missingSkills.slice(0, 4)
    : ["advanced projects", "system design", "interview practice", "portfolio polish"];
  return focusSkills.map((skill, index) => ({
    week: `Week ${index + 1}`,
    focus: skill,
    tasks: [
      `Study the core concepts of ${skill}.`,
      `Build one small proof-of-work task using ${skill}.`,
      `Add a resume bullet that shows measurable impact with ${skill}.`,
    ],
  }));
}

function buildProjectIdeas({ targetRole, missingSkills, matchedSkills }) {
  const role = targetRole || "target role";
  const ideas = [
    {
      title: "Job Match Intelligence Dashboard",
      description: `Build a dashboard that compares resumes with job descriptions for ${role} applications.`,
      skills: [...new Set([...matchedSkills.slice(0, 2), ...missingSkills.slice(0, 3)])],
    },
    {
      title: "AI Interview Practice Coach",
      description: "Create an assistant that asks role-specific questions, scores answers, and suggests better responses.",
      skills: [...new Set(["generative ai", "prompt engineering", ...missingSkills.slice(0, 2)])],
    },
    {
      title: "ATS Resume PDF Builder",
      description: "Generate clean PDF resumes from structured profile data with keyword optimization.",
      skills: [...new Set(["puppeteer", "javascript", ...matchedSkills.slice(0, 2)])],
    },
  ];
  return ideas.map((idea) => ({ ...idea, skills: idea.skills.filter(Boolean) }));
}

function buildKeywordInsights({ jobSkills, matchedSkills }) {
  return jobSkills.map((skill, index) => ({
    keyword: skill,
    status: matchedSkills.includes(skill) ? "Found" : "Missing",
    priority: index < 5 ? "High" : "Medium",
  }));
}

function buildApplicationChecklist({ missingSkills, atsScore }) {
  return [
    atsScore >= 75 ? "ATS score is strong enough for submission." : "Improve ATS score before applying.",
    missingSkills.length
      ? "Add missing high-priority skills into summary, skills, and project bullets."
      : "Keep keywords natural and avoid stuffing repeated phrases.",
    "Add metrics such as users, latency, revenue, accuracy, time saved, or completion rate.",
    "Export the optimized PDF and use the same keywords in your cover letter.",
    "Prepare interview stories for every skill mentioned in the job description.",
  ];
}

function buildAtsBreakdown({ matchedSkills, jobSkills, resumeText }) {
  const lower = resumeText.toLowerCase();
  const keywordScore = jobSkills.length ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 50;
  const hasSections = ["experience", "skills", "education", "projects"]
    .filter((section) => lower.includes(section)).length;
  const hasMetrics = /\b\d+%|\b\d+\+|\b\d{2,}\b/.test(resumeText);
  const hasActionWords = /(built|led|improved|created|optimized|developed|reduced|increased|delivered)/i.test(resumeText);
  return [
    { label: "Keyword Coverage", score: Math.min(100, keywordScore), feedback: "Matches exact skills and tools from the job description." },
    { label: "ATS Structure", score: Math.round((hasSections / 4) * 100), feedback: "Checks standard sections like Experience, Skills, Education, and Projects." },
    { label: "Impact Metrics", score: hasMetrics ? 90 : 35, feedback: "Modern recruiters expect numbers that prove scale, speed, quality, or business impact." },
    { label: "Action Language", score: hasActionWords ? 88 : 45, feedback: "Strong bullet points should start with outcome-focused action verbs." },
  ];
}

function buildSemanticMatches({ jobSkills, matchedSkills, missingSkills }) {
  const found = matchedSkills.slice(0, 5).map((skill) => ({
    requirement: skill,
    evidence: `Resume directly mentions ${skill} and can be strengthened with a project result.`,
    strength: "Strong",
  }));
  const gaps = missingSkills.slice(0, 5).map((skill) => ({
    requirement: skill,
    evidence: `No clear evidence found for ${skill}. Add a project, tool, or measurable bullet.`,
    strength: "Needs evidence",
  }));
  return [...found, ...gaps].slice(0, Math.max(6, Math.min(10, jobSkills.length)));
}

function buildBulletRewrites({ targetRole, matchedSkills, missingSkills }) {
  const role = targetRole || "target role";
  const skills = [...matchedSkills, ...missingSkills].slice(0, 4).join(", ") || "core role skills";
  return [
    {
      original: "Worked on web application features.",
      optimized: `Developed ${role} features using ${skills}, improving usability and aligning delivery with job-critical requirements.`,
    },
    {
      original: "Responsible for backend APIs.",
      optimized: "Built and maintained reliable API workflows with clear authentication, validation, and database integration for production-ready delivery.",
    },
    {
      original: "Made resume project using AI.",
      optimized: "Created an AI resume analyzer that parses resumes, compares job descriptions, detects skill gaps, and generates ATS-ready application assets.",
    },
  ];
}

function buildLinkedinProfile({ targetRole, matchedSkills, missingSkills }) {
  const role = targetRole || "AI-ready software professional";
  const strengths = matchedSkills.slice(0, 5).join(" | ") || "Full-stack development | Problem solving | Product thinking";
  return {
    headline: `${role} | ${strengths} | Building practical AI-powered career tools`,
    about: `I build practical, user-focused software with strengths in ${matchedSkills.slice(0, 4).join(", ") || "modern web development"}. I am currently sharpening ${missingSkills.slice(0, 3).join(", ") || "advanced project impact and interview readiness"} to align with high-growth roles. My work focuses on clean implementation, measurable outcomes, and AI-assisted productivity.`,
    featuredItems: [
      "ATS Resume Analyzer with skill-gap detection",
      "AI Interview Question Generator",
      "Puppeteer PDF Resume Builder",
    ],
  };
}

function buildColdEmail({ targetRole, matchedSkills }) {
  const role = targetRole || "the role";
  const skills = matchedSkills.slice(0, 3).join(", ") || "full-stack development and AI workflows";
  return `Subject: Interested in ${role}\n\nHi Hiring Team,\n\nI came across your opening for ${role} and wanted to reach out directly. My recent work includes ${skills}, and I have built practical projects that connect resume parsing, job-description analysis, ATS optimization, and AI-generated interview preparation.\n\nI would be glad to share how my experience can support your team.\n\nBest,\nYour Name`;
}

function buildApplicationTracker({ atsScore, missingSkills }) {
  return [
    {
      stage: "Resume Scan",
      status: atsScore >= 75 ? "Ready" : "Needs improvement",
      nextAction: atsScore >= 75 ? "Export ATS PDF." : "Improve score using recommendations.",
    },
    {
      stage: "Skill Proof",
      status: missingSkills.length ? "Pending" : "Ready",
      nextAction: missingSkills.length
        ? `Add evidence for ${missingSkills.slice(0, 2).join(", ")}.`
        : "Keep project evidence visible.",
    },
    {
      stage: "Outreach",
      status: "Draft ready",
      nextAction: "Personalize cold email with company name and recruiter details.",
    },
    {
      stage: "Interview Prep",
      status: "Generated",
      nextAction: "Practice answers using the generated role-specific questions.",
    },
  ];
}

function analyzeResume({ resumeText, jobDescription = "", targetRole = "" }) {
  const cleanResumeText = normalizeInput(resumeText, 30000);
  const cleanJobDescription = normalizeInput(jobDescription, 20000);
  const cleanTargetRole = normalizeInput(targetRole, 120);

  if (!cleanResumeText || cleanResumeText.length < 40) {
    throw new Error("Resume text is too short to analyze.");
  }
  if (!cleanJobDescription || cleanJobDescription.length < 40) {
    throw new Error("Job description is too short to analyze.");
  }

  const extractedSkills = extractSkills(cleanResumeText);
  const jobSkills = extractSkills(cleanJobDescription);
  const matchedSkills = extractedSkills.filter((skill) => jobSkills.includes(skill));
  const missingSkills = jobSkills.filter((skill) => !extractedSkills.includes(skill));
  const atsScore = calculateAtsScore({ matchedSkills, jobSkills, resumeText: cleanResumeText });

  return {
    extractedSkills,
    jobSkills,
    matchedSkills,
    missingSkills,
    atsScore,
    recommendations: buildRecommendations(missingSkills),
    interviewQuestions: buildInterviewQuestions({ matchedSkills, missingSkills, targetRole: cleanTargetRole }),
    coverLetter: buildCoverLetter({ targetRole: cleanTargetRole, matchedSkills, missingSkills }),
    recruiterPitch: buildRecruiterPitch({ targetRole: cleanTargetRole, matchedSkills, atsScore }),
    learningRoadmap: buildLearningRoadmap(missingSkills),
    projectIdeas: buildProjectIdeas({ targetRole: cleanTargetRole, missingSkills, matchedSkills }),
    keywordInsights: buildKeywordInsights({ jobSkills, matchedSkills }),
    applicationChecklist: buildApplicationChecklist({ missingSkills, atsScore }),
    atsBreakdown: buildAtsBreakdown({ matchedSkills, jobSkills, resumeText: cleanResumeText }),
    semanticMatches: buildSemanticMatches({ jobSkills, matchedSkills, missingSkills }),
    bulletRewrites: buildBulletRewrites({ targetRole: cleanTargetRole, matchedSkills, missingSkills }),
    linkedinProfile: buildLinkedinProfile({ targetRole: cleanTargetRole, matchedSkills, missingSkills }),
    coldEmail: buildColdEmail({ targetRole: cleanTargetRole, matchedSkills }),
    applicationTracker: buildApplicationTracker({ atsScore, missingSkills }),
    atsResume: buildAtsResume({
      resumeText: cleanResumeText,
      targetRole: cleanTargetRole,
      jobDescription: cleanJobDescription,
      matchedSkills,
      missingSkills,
    }),
  };
}

module.exports = { analyzeResume, parseResumeFile };