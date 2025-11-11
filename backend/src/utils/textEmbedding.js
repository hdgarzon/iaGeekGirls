const DEFAULT_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "de",
  "del",
  "en",
  "la",
  "el",
  "las",
  "los",
  "of",
  "para",
  "por",
  "que",
  "the",
  "un",
  "una",
  "y"
]);

function normalizeText(value) {
  if (!value) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[^a-z0-9+#]+/g)
    .filter((token) => token && !DEFAULT_STOPWORDS.has(token));
}

function toFrequencyMap(text) {
  const tokens = Array.isArray(text) ? text.flatMap(tokenize) : tokenize(text);
  return tokens.reduce((map, token) => {
    map[token] = (map[token] || 0) + 1;
    return map;
  }, {});
}

function cosineSimilarity(mapA, mapB) {
  const tokensA = Object.keys(mapA);
  const tokensB = Object.keys(mapB);
  if (!tokensA.length || !tokensB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const token of tokensA) {
    const valueA = mapA[token] || 0;
    const valueB = mapB[token] || 0;
    dotProduct += valueA * valueB;
    normA += valueA ** 2;
  }

  for (const token of tokensB) {
    const value = mapB[token] || 0;
    normB += value ** 2;
  }

  if (!normA || !normB) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function buildProfileDocument(profile = {}) {
  const segments = [
    profile.fullName,
    profile.email,
    profile.country,
    profile.program,
    profile.graduationYear,
    profile.primaryArea,
    profile.experienceYears,
    profile.languages?.join(" "),
    profile.tools?.join(" "),
    profile.techInterests?.join(" "),
    profile.motivations?.join(" "),
    profile.techSkills?.join(" "),
    profile.softSkills?.join(" "),
    profile.workPreference,
    profile.companyPreference,
    profile.salaryExpectation,
    profile.learningStyles?.join(" "),
    profile.learningTopics?.join(" "),
    profile.impactStatement,
    profile.confidenceLevel,
    profile.expectations?.join(" ")
  ];

  return segments.filter(Boolean).join(" ");
}

module.exports = {
  tokenize,
  toFrequencyMap,
  cosineSimilarity,
  buildProfileDocument
};

