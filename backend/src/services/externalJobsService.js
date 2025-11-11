const fs = require("fs");
const path = require("path");
const axios = require("axios");

const samplePath = path.resolve(
  __dirname,
  "../data/externalJobsSample.json"
);

function loadSampleJobs() {
  const buffer = fs.readFileSync(samplePath, "utf-8");
  return JSON.parse(buffer);
}

async function fetchAdzunaJobs(profile) {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;
  if (!appId || !apiKey) {
    return [];
  }

  const country = (profile.country || "co").toLowerCase();
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;
  const params = {
    app_id: appId,
    app_key: apiKey,
    results_per_page: 5,
    what: profile.primaryArea || profile.techInterests?.[0] || "STEM"
  };

  const { data } = await axios.get(url, { params });
  return (data.results || []).map((job) => ({
    id: job.id,
    role: job.title,
    skills: [],
    softSkills: [],
    description: job.description,
    source: "Adzuna API",
    sourceUrl: job.redirect_url,
    lastUpdated: job.created
  }));
}

async function fetchRemotiveJobs(profile) {
  const { data } = await axios.get("https://remotive.com/api/remote-jobs");
  const normalizedArea = (profile.primaryArea || "").toLowerCase();

  return (data.jobs || [])
    .filter((job) =>
      normalizedArea
        ? job.job_type?.toLowerCase().includes(normalizedArea) ||
          job.title?.toLowerCase().includes(normalizedArea)
        : true
    )
    .slice(0, 5)
    .map((job) => ({
      id: job.id || job.url,
      role: job.title,
      skills: [],
      softSkills: [],
      description: job.description,
      source: "Remotive API",
      sourceUrl: job.url,
      lastUpdated: job.publication_date
    }));
}

async function fetchExternalJobs(profile) {
  const sampleJobs = loadSampleJobs();

  const results = [...sampleJobs];

  try {
    const [adzunaJobs, remotiveJobs] = await Promise.allSettled([
      fetchAdzunaJobs(profile),
      fetchRemotiveJobs(profile)
    ]);

    if (adzunaJobs.status === "fulfilled") {
      results.push(...adzunaJobs.value);
    }
    if (remotiveJobs.status === "fulfilled") {
      results.push(...remotiveJobs.value);
    }
  } catch (error) {
    console.warn("Error fetching external jobs", error.message);
  }

  return results;
}

module.exports = {
  fetchExternalJobs
};

