const puppeteer = require("puppeteer");

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function list(items = []) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function resumeHtml(atsResume) {
  const safeResume = {
    name: atsResume?.name || "Your Name",
    title: atsResume?.title || "Target Role",
    summary: atsResume?.summary || "Professional summary not available.",
    skills: Array.isArray(atsResume?.skills) ? atsResume.skills : [],
    experienceBullets: Array.isArray(atsResume?.experienceBullets) ? atsResume.experienceBullets : [],
    projects: Array.isArray(atsResume?.projects) ? atsResume.projects : [],
  };

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; margin: 42px; color: #1f2933; line-height: 1.45; }
          h1 { margin: 0; font-size: 30px; letter-spacing: 0; }
          h2 { margin: 22px 0 8px; font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #d9e2ec; padding-bottom: 5px; }
          p { margin: 8px 0; }
          ul { margin: 8px 0 0 18px; padding: 0; }
          li { margin-bottom: 6px; }
          .title { color: #52606d; font-size: 16px; margin-top: 4px; }
          .skills { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
          .skill { border: 1px solid #bcccdc; border-radius: 4px; padding: 4px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(safeResume.name)}</h1>
        <p class="title">${escapeHtml(safeResume.title)}</p>

        <h2>Professional Summary</h2>
        <p>${escapeHtml(safeResume.summary)}</p>

        <h2>Core Skills</h2>
        <div class="skills">
          ${safeResume.skills.map((skill) => `<span class="skill">${escapeHtml(skill)}</span>`).join("")}
        </div>

        <h2>Experience</h2>
        <ul>${list(safeResume.experienceBullets)}</ul>

        <h2>Projects</h2>
        <ul>${list(safeResume.projects)}</ul>
      </body>
    </html>
  `;
}

async function createResumePdf(atsResume) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(resumeHtml(atsResume), { waitUntil: "networkidle0" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0.35in", right: "0.35in", bottom: "0.35in", left: "0.35in" },
    });
  } finally {
    await browser.close();
  }
}

module.exports = {
  createResumePdf,
};
