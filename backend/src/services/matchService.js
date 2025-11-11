const fs = require("fs");
const path = require("path");
const {
  toFrequencyMap,
  cosineSimilarity,
  buildProfileDocument
} = require("../utils/textEmbedding");

const datasetPath = path.resolve(__dirname, "../data/rolesDataset.json");

function loadDataset() {
  const buffer = fs.readFileSync(datasetPath, "utf-8");
  return JSON.parse(buffer);
}

function buildRoleDocument(roleEntry) {
  const segments = [
    roleEntry.role,
    roleEntry.description,
    ...(roleEntry.skills || []),
    ...(roleEntry.softSkills || []),
    roleEntry.source
  ];

  return segments.filter(Boolean).join(" ");
}

function computeOverlap(listA = [], listB = []) {
  const normalizedB = new Set(
    listB.map((item) => item.toLowerCase().trim()).filter(Boolean)
  );
  return listA
    .map((item) => item?.trim())
    .filter((item) => item && normalizedB.has(item.toLowerCase()));
}

function rankRolesForProfile(profile, externalJobs = [], topK = 3) {
  const dataset = loadDataset();
  const profileDocument = buildProfileDocument(profile);
  const profileVector = toFrequencyMap(profileDocument);

  const roleEntries = [
    ...dataset.map((entry) => ({
      type: "dataset",
      payload: entry
    })),
    ...externalJobs.map((entry) => ({
      type: "external",
      payload: entry
    }))
  ];

  const profileSkills = [
    ...(profile.techSkills || []),
    ...(profile.tools || []),
    ...(profile.languages || [])
  ];
  const profileSoftSkills = profile.softSkills || [];

  const scored = roleEntries
    .map(({ payload, type }) => {
      const document = buildRoleDocument(payload);
      const vector = toFrequencyMap(document);
      const score = cosineSimilarity(profileVector, vector);

      const matchedSkills = computeOverlap(payload.skills || [], profileSkills);
      const missingSkills = (payload.skills || []).filter(
        (skill) =>
          !matchedSkills.find(
            (matched) => matched.toLowerCase() === skill.toLowerCase()
          )
      );

      const softSkillOverlap = computeOverlap(
        payload.softSkills || [],
        profileSoftSkills
      );

      const rationale = [
        matchedSkills.length
          ? `Coincidencia en habilidades técnicas: ${matchedSkills.join(", ")}`
          : null,
        softSkillOverlap.length
          ? `Habilidades blandas alineadas: ${softSkillOverlap.join(", ")}`
          : null,
        profile.motivations?.length
          ? `Motivaciones clave: ${profile.motivations.join(", ")}`
          : null
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        id: payload.id || payload.role,
        role: payload.role,
        description: payload.description,
        source: payload.source || payload.provider || "Fuente externa",
        sourceUrl: payload.sourceUrl || payload.url,
        score: Number(score.toFixed(4)),
        matchedSkills,
        missingSkills,
        softSkillOverlap,
        rationale,
        lastUpdated: payload.lastUpdated || new Date().toISOString(),
        type
      };
    })
    .filter((entry) => entry.score > 0);

  const sorted = scored.sort((a, b) => b.score - a.score);
  const topMatches = sorted.slice(0, topK);

  return {
    matches: topMatches,
    metadata: {
      totalCandidates: scored.length,
      generatedAt: new Date().toISOString(),
      profileId: profile.id
    }
  };
}

module.exports = {
  rankRolesForProfile
};

