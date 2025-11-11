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

function generateCareerJourney(profile, matches) {
  const journey = {
    currentAssessment: {
      strengths: [],
      areasForImprovement: [],
      careerLevel: "entry"
    },
    phases: [
      {
        name: "Preparación Inicial (1-3 meses)",
        duration: "1-3 meses",
        goals: [],
        actions: [],
        resources: []
      },
      {
        name: "Desarrollo Técnico (3-6 meses)",
        duration: "3-6 meses",
        goals: [],
        actions: [],
        resources: []
      },
      {
        name: "Experiencia Práctica (6-12 meses)",
        duration: "6-12 meses",
        goals: [],
        actions: [],
        resources: []
      },
      {
        name: "Crecimiento Profesional (1-2 años)",
        duration: "1-2 años",
        goals: [],
        actions: [],
        resources: []
      }
    ]
  };

  // Assess current level based on experience
  const experienceYears = profile.experienceYears || 0;
  if (experienceYears < 1) {
    journey.currentAssessment.careerLevel = "entry";
  } else if (experienceYears < 3) {
    journey.currentAssessment.careerLevel = "junior";
  } else if (experienceYears < 5) {
    journey.currentAssessment.careerLevel = "mid";
  } else {
    journey.currentAssessment.careerLevel = "senior";
  }

  // Analyze strengths and areas for improvement
  const allMatchedSkills = matches.flatMap(match => match.matchedSkills || []);
  const allMissingSkills = matches.flatMap(match => match.missingSkills || []);
  const uniqueMatchedSkills = [...new Set(allMatchedSkills)];
  const uniqueMissingSkills = [...new Set(allMissingSkills)];

  journey.currentAssessment.strengths = uniqueMatchedSkills.slice(0, 5);
  journey.currentAssessment.areasForImprovement = uniqueMissingSkills.slice(0, 5);

  // Generate phase-specific recommendations
  const primaryArea = profile.primaryArea || "tecnología";

  // Phase 1: Foundation
  journey.phases[0].goals = [
    "Dominar fundamentos técnicos básicos",
    "Desarrollar habilidades de comunicación",
    "Construir portafolio inicial"
  ];
  journey.phases[0].actions = [
    "Completar cursos online de fundamentos",
    "Participar en proyectos personales",
    "Unirse a comunidades técnicas",
    "Practicar resolución de problemas"
  ];
  journey.phases[0].resources = [
    "freeCodeCamp, Coursera, edX",
    "Documentación oficial de tecnologías",
    "Comunidades en Discord/Reddit",
    "GitHub para proyectos personales"
  ];

  // Phase 2: Technical Development
  journey.phases[1].goals = [
    `Especializarse en ${primaryArea}`,
    "Aprender frameworks y herramientas modernas",
    "Desarrollar habilidades de debugging"
  ];
  journey.phases[1].actions = [
    "Tomar cursos especializados",
    "Contribuir a proyectos open source",
    "Practicar con challenges de coding",
    "Aprender sobre arquitectura de software"
  ];
  journey.phases[1].resources = [
    "Udemy, Pluralsight, LinkedIn Learning",
    "MDN Web Docs, documentación oficial",
    "LeetCode, HackerRank, CodeWars",
    "Libros técnicos recomendados"
  ];

  // Phase 3: Practical Experience
  journey.phases[2].goals = [
    "Ganar experiencia laboral real",
    "Trabajar en proyectos complejos",
    "Desarrollar habilidades de liderazgo"
  ];
  journey.phases[2].actions = [
    "Buscar oportunidades de freelance",
    "Participar en hackathons",
    "Mentorear a principiantes",
    "Tomar certificaciones relevantes"
  ];
  journey.phases[2].resources = [
    "Upwork, Fiverr para freelance",
    "Devpost, AngelHack para hackathons",
    "Meetup, eventos locales de tech",
    "Certificaciones AWS, Google, Microsoft"
  ];

  // Phase 4: Professional Growth
  journey.phases[3].goals = [
    "Alcanzar posiciones de liderazgo",
    "Contribuir a la comunidad técnica",
    "Desarrollar emprendimiento"
  ];
  journey.phases[3].actions = [
    "Buscar posiciones senior o liderazgo",
    "Dar charlas y workshops",
    "Mentorear activamente",
    "Considerar emprendimiento tech"
  ];
  journey.phases[3].resources = [
    "Conferencias como JSConf, ReactConf",
    "Comunidades de liderazgo técnico",
    "Programas de mentoreo",
    "Recursos para emprendimiento"
  ];

  return journey;
}

module.exports = {
  rankRolesForProfile,
  generateCareerJourney
};

