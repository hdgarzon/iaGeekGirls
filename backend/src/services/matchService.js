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

function buildLearningPathDocument(pathEntry) {
  const segments = [
    pathEntry.title,
    pathEntry.area,
    pathEntry.description,
    ...(pathEntry.modules?.flatMap(module => module.topics) || []),
    pathEntry.source
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

function recommendLearningPaths(profile, topK = 3) {
  const dataset = loadDataset();
  const profileDocument = buildProfileDocument(profile);
  const profileVector = toFrequencyMap(profileDocument);

  // Determinar nivel del usuario basado en experiencia
  let userLevel = "beginner";
  const experienceYears = profile.experienceYears || 0;
  if (experienceYears >= 3) {
    userLevel = "advanced";
  } else if (experienceYears >= 1) {
    userLevel = "intermediate";
  }

  // Extraer intereses y habilidades del perfil
  const profileInterests = [
    ...(profile.techInterests || []),
    ...(profile.primaryArea ? [profile.primaryArea] : []),
    ...(profile.motivations || [])
  ];

  const profileSkills = [
    ...(profile.techSkills || []),
    ...(profile.tools || []),
    ...(profile.languages || [])
  ];

  const scored = dataset
    .map((path) => {
      const document = buildLearningPathDocument(path);
      const vector = toFrequencyMap(document);
      let score = cosineSimilarity(profileVector, vector);

      // Bonus por coincidencia de nivel
      if (path.level === userLevel) {
        score += 0.3;
      } else if (
        (userLevel === "beginner" && path.level === "intermediate") ||
        (userLevel === "intermediate" && path.level === "advanced")
      ) {
        score += 0.1;
      }

      // Bonus por intereses alineados
      const interestOverlap = computeOverlap(
        profileInterests,
        [path.area, path.title, ...(path.modules?.flatMap(m => m.topics) || [])]
      );
      score += interestOverlap.length * 0.1;

      // Penalización por prerrequisitos no cumplidos
      const prerequisites = path.prerequisites || [];
      const hasPrerequisites = prerequisites.some(prereq =>
        profileSkills.some(skill =>
          prereq.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(prereq.toLowerCase())
        )
      );

      if (prerequisites.length > 0 && !hasPrerequisites && userLevel === "beginner") {
        score -= 0.2;
      }

      // Calcular habilidades requeridas vs poseídas
      const requiredSkills = path.modules?.flatMap(module => module.topics) || [];
      const matchedSkills = computeOverlap(requiredSkills, profileSkills);
      const missingSkills = requiredSkills.filter(
        (skill) =>
          !matchedSkills.find(
            (matched) => matched.toLowerCase() === skill.toLowerCase()
          )
      );

      const rationale = [
        path.level === userLevel
          ? `Nivel apropiado para ti (${path.level})`
          : `Transición de nivel: ${userLevel} → ${path.level}`,
        matchedSkills.length
          ? `Ya tienes ${matchedSkills.length} habilidades requeridas`
          : null,
        interestOverlap.length
          ? `Alineado con tus intereses: ${interestOverlap.slice(0, 2).join(", ")}`
          : null,
        path.duration
          ? `Duración estimada: ${path.duration}`
          : null
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        id: path.id,
        title: path.title,
        area: path.area,
        level: path.level,
        duration: path.duration,
        description: path.description,
        prerequisites: path.prerequisites,
        modules: path.modules,
        careerOutcomes: path.careerOutcomes,
        source: path.source,
        sourceUrl: path.sourceUrl,
        score: Number(score.toFixed(4)),
        matchedSkills,
        missingSkills,
        rationale,
        lastUpdated: path.lastUpdated || new Date().toISOString(),
        type: "learning-path"
      };
    })
    .filter((entry) => entry.score > 0);

  const sorted = scored.sort((a, b) => b.score - a.score);
  const topRecommendations = sorted.slice(0, topK);

  return {
    recommendations: topRecommendations,
    metadata: {
      totalCandidates: scored.length,
      userLevel,
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

function generateLearningJourney(profile, recommendations) {
  const journey = {
    currentAssessment: {
      strengths: [],
      areasForImprovement: [],
      learningLevel: "beginner"
    },
    phases: [
      {
        name: "Exploración y Fundamentos (1-2 meses)",
        duration: "1-2 meses",
        goals: [],
        actions: [],
        resources: []
      },
      {
        name: "Desarrollo de Habilidades (2-4 meses)",
        duration: "2-4 meses",
        goals: [],
        actions: [],
        resources: []
      },
      {
        name: "Proyecto Práctico (2-3 meses)",
        duration: "2-3 meses",
        goals: [],
        actions: [],
        resources: []
      },
      {
        name: "Especialización y Crecimiento (3-6 meses)",
        duration: "3-6 meses",
        goals: [],
        actions: [],
        resources: []
      }
    ]
  };

  // Determinar nivel de aprendizaje
  const experienceYears = profile.experienceYears || 0;
  if (experienceYears < 1) {
    journey.currentAssessment.learningLevel = "beginner";
  } else if (experienceYears < 3) {
    journey.currentAssessment.learningLevel = "intermediate";
  } else {
    journey.currentAssessment.learningLevel = "advanced";
  }

  // Analizar fortalezas y áreas de mejora basadas en recomendaciones
  const allMatchedSkills = recommendations.flatMap(rec => rec.matchedSkills || []);
  const allMissingSkills = recommendations.flatMap(rec => rec.missingSkills || []);
  const uniqueMatchedSkills = [...new Set(allMatchedSkills)];
  const uniqueMissingSkills = [...new Set(allMissingSkills)];

  journey.currentAssessment.strengths = uniqueMatchedSkills.slice(0, 5);
  journey.currentAssessment.areasForImprovement = uniqueMissingSkills.slice(0, 5);

  // Fase 1: Exploración
  journey.phases[0].goals = [
    "Descubrir áreas de interés en STEM",
    "Construir conocimientos básicos",
    "Desarrollar confianza en el aprendizaje"
  ];
  journey.phases[0].actions = [
    "Completar cursos introductorios en plataformas gratuitas",
    "Unirte a comunidades STEM en redes sociales",
    "Participar en talleres y webinars gratuitos",
    "Experimentar con herramientas básicas"
  ];
  journey.phases[0].resources = [
    "Coursera audít, edX, Khan Academy",
    "Comunidades en Reddit (r/learnprogramming, r/datascience)",
    "YouTube channels: freeCodeCamp, CS Dojo",
    "Meetups locales de tecnología"
  ];

  // Fase 2: Desarrollo de Habilidades
  journey.phases[1].goals = [
    "Dominar fundamentos técnicos",
    "Desarrollar proyectos personales",
    "Construir portafolio básico"
  ];
  journey.phases[1].actions = [
    "Tomar cursos especializados en tu área de interés",
    "Practicar diariamente con ejercicios y challenges",
    "Contribuir a proyectos open source simples",
    "Unirte a grupos de estudio"
  ];
  journey.phases[1].resources = [
    "Udemy, LinkedIn Learning (becas disponibles)",
    "LeetCode, HackerRank, Exercism",
    "GitHub para proyectos personales",
    "Discord communities, study groups"
  ];

  // Fase 3: Proyecto Práctico
  journey.phases[2].goals = [
    "Aplicar conocimientos en proyectos reales",
    "Desarrollar habilidades de resolución de problemas",
    "Construir experiencia práctica"
  ];
  journey.phases[2].actions = [
    "Desarrollar un proyecto personal completo",
    "Participar en hackathons o challenges",
    "Buscar oportunidades de freelance junior",
    "Mentorear a principiantes"
  ];
  journey.phases[2].resources = [
    "Devpost, AngelHack para hackathons",
    "Upwork, Fiverr para proyectos freelance",
    "GitHub portfolio, LinkedIn",
    "Mentorship programs gratuitos"
  ];

  // Fase 4: Especialización y Crecimiento
  journey.phases[3].goals = [
    "Especializarse en un área específica",
    "Contribuir a la comunidad STEM",
    "Buscar oportunidades profesionales"
  ];
  journey.phases[3].actions = [
    "Tomar certificaciones reconocidas",
    "Contribuir activamente a comunidades",
    "Buscar pasantías o posiciones junior",
    "Desarrollar emprendimientos tecnológicos"
  ];
  journey.phases[3].resources = [
    "Certificaciones Google, AWS, Microsoft (becas)",
    "Conferencias: PyCon, JSConf, Women Techmakers",
    "LinkedIn, Indeed para oportunidades",
    "Programas de emprendimiento para mujeres"
  ];

  return journey;
}

module.exports = {
  recommendLearningPaths,
  generateLearningJourney
};

