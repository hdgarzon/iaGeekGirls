const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const {
  saveProfile,
  updateProfile,
  getProfile,
  listProfiles
} = require("./services/profileRepository");
const { recommendLearningPaths, generateLearningJourney } = require("./services/matchService");
const { fetchExternalJobs } = require("./services/externalJobsService");
const {
  getCareerResources,
  getAllCareerResources,
  getEducationalResources,
  getSalaryData,
  getMarketData
} = require("./services/resourcesService");

const PORT = process.env.PORT || 4000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4000",
  "https://ia.geekgirlslatam.org",
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : [])
].filter(Boolean);

const app = express();
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Resources endpoints
app.get("/api/resources", (req, res) => {
  try {
    const resources = getAllCareerResources();
    res.json({ resources });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ message: "Error al obtener recursos" });
  }
});

app.get("/api/resources/:careerId", (req, res) => {
  try {
    const { careerId } = req.params;
    const resources = getCareerResources(careerId);
    if (!resources) {
      return res.status(404).json({ message: "Recursos no encontrados para esta carrera" });
    }
    res.json({ resources });
  } catch (error) {
    console.error("Error fetching career resources:", error);
    res.status(500).json({ message: "Error al obtener recursos de carrera" });
  }
});

app.get("/api/resources/:careerId/education", (req, res) => {
  try {
    const { careerId } = req.params;
    const resources = getEducationalResources(careerId);
    res.json({ educationalResources: resources });
  } catch (error) {
    console.error("Error fetching educational resources:", error);
    res.status(500).json({ message: "Error al obtener recursos educativos" });
  }
});

app.get("/api/resources/:careerId/salary", (req, res) => {
  try {
    const { careerId } = req.params;
    const salaryData = getSalaryData(careerId);
    if (!salaryData) {
      return res.status(404).json({ message: "Datos salariales no encontrados" });
    }
    res.json({ salaryData });
  } catch (error) {
    console.error("Error fetching salary data:", error);
    res.status(500).json({ message: "Error al obtener datos salariales" });
  }
});

app.get("/api/resources/:careerId/market", (req, res) => {
  try {
    const { careerId } = req.params;
    const marketData = getMarketData(careerId);
    if (!marketData) {
      return res.status(404).json({ message: "Datos de mercado no encontrados" });
    }
    res.json({ marketData });
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({ message: "Error al obtener datos de mercado" });
  }
});

app.get("/api/profiles", (req, res) => {
  res.json({ profiles: listProfiles() });
});

app.post("/api/profiles", (req, res) => {
  const payload = req.body;
  if (!payload || !payload.fullName || !payload.email) {
    return res.status(400).json({
      message: "Los campos fullName y email son obligatorios."
    });
  }

  const profile = saveProfile(payload);
  res.status(201).json({ profile });
});

app.put("/api/profiles/:id", (req, res) => {
  const { id } = req.params;
  const updated = updateProfile(id, req.body);
  if (!updated) {
    return res.status(404).json({ message: "Perfil no encontrado" });
  }
  res.json({ profile: updated });
});

app.post("/api/match", async (req, res) => {
  try {
    const { profileId, profile: profilePayload, persist = false } = req.body;

    let profile = profilePayload;

    if (profileId) {
      profile = getProfile(profileId);
    } else if (persist && !profilePayload?.id) {
      profile = saveProfile(profilePayload);
    }

    if (!profile) {
      return res.status(400).json({
        message:
          "Debes enviar un profile válido o un profileId existente para generar el match."
      });
    }

    const result = recommendLearningPaths(profile);
    const journey = generateLearningJourney(profile, result.recommendations);

    res.json({
      profile,
      ...result,
      journey
    });
  } catch (error) {
    console.error("Error generating match", error);
    res.status(500).json({
      message: "No fue posible generar el match en este momento.",
      detail: error.message
    });
  }
});

app.post("/api/pdf", (req, res) => {
  try {
    const { profileId, profile: profilePayload, matches = [], journey } = req.body;
    const profile = profilePayload || getProfile(profileId);

    if (!profile) {
      return res
        .status(400)
        .json({ message: "Perfil no encontrado para generar el PDF." });
    }

    const filename = `match-report-${
      profile.fullName?.toLowerCase().replace(/\s+/g, "-") || profile.id
    }.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    const primaryColor = "#34267E";
    const secondaryColor = "#FF0084";
    const neutralColor = "#F7F7FC";

    // Header
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill(primaryColor)
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("Geek Girls LatAm", 50, 40);
    doc
      .fontSize(14)
      .text("Rutas Personalizadas de Aprendizaje STEM", 50, 70);

    doc.moveDown(2);
    doc.fillColor("#000000").fontSize(18).text("Resumen del perfil", {
      underline: true
    });
    doc.moveDown(0.5);

    const profileDetails = [
      `Nombre: ${profile.fullName}`,
      `Correo: ${profile.email}`,
      `País: ${profile.country}`,
      `Programa: ${profile.program}`,
      `Año de egreso: ${profile.graduationYear}`,
      `Área principal: ${profile.primaryArea}`,
      `Experiencia: ${profile.experienceYears}`,
      `Preferencia laboral: ${profile.workPreference}`,
      `Tipo de empresa: ${profile.companyPreference}`,
      `Confianza en el perfil: ${profile.confidenceLevel}`
    ].filter(Boolean);

    doc
      .fontSize(11)
      .list(profileDetails, { bulletRadius: 2, textIndent: 20, indent: 20 });

    doc.moveDown(1.5);
    doc
      .fillColor(primaryColor)
      .fontSize(16)
      .text("Top 3 rutas de aprendizaje recomendadas", { underline: true });
    doc.moveDown(0.5);

    if (!matches.length) {
      doc
        .fillColor("#000000")
        .fontSize(12)
        .text(
          "Aún no se han generado recomendaciones. Ejecuta el endpoint /api/match primero."
        );
    } else {
      matches.forEach((match, idx) => {
        doc
          .fillColor(primaryColor)
          .fontSize(14)
          .text(`${idx + 1}. ${match.role}`);
        doc.moveDown(0.2);
        doc
          .fillColor("#000")
          .fontSize(11)
          .text(`Nivel de ajuste: ${(match.score * 100).toFixed(1)}%`);
        if (match.matchedSkills?.length) {
          doc.text(`Habilidades destacadas: ${match.matchedSkills.join(", ")}`);
        }
        if (match.softSkillOverlap?.length) {
          doc.text(
            `Habilidades blandas alineadas: ${match.softSkillOverlap.join(", ")}`
          );
        }
        if (match.description) {
          doc.moveDown(0.3);
          doc.fontSize(10).fillColor("#333").text(match.description);
        }
        if (match.source) {
          doc
            .fontSize(9)
            .fillColor(secondaryColor)
            .text(
              `Fuente: ${match.source}`,
              { link: match.sourceUrl, underline: !!match.sourceUrl }
            );
        }
        doc.moveDown(0.6);
        doc
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .strokeColor(neutralColor)
          .stroke();
        doc.moveDown(0.6);
      });
    }

    // Add Journey section (Journey de Aprendizaje)
    if (journey) {
      doc.addPage();
      doc.fillColor(primaryColor).fontSize(16).text("Journey de Aprendizaje", {
        underline: true
      });
      doc.moveDown(0.5);

      // Current Assessment
      doc.fillColor(primaryColor).fontSize(14).text("Evaluacion Actual", {
        underline: true
      });
      doc.moveDown(0.3);

      doc.fillColor("#000").fontSize(11);
      doc.text(`Nivel profesional: ${journey.currentAssessment.careerLevel || 'No evaluado'}`);

      if (journey.currentAssessment.strengths?.length) {
        doc.moveDown(0.3);
        doc.fillColor("#000").text("Fortalezas:");
        journey.currentAssessment.strengths.forEach(strength => {
          doc.text(`• ${strength}`);
        });
      }

      if (journey.currentAssessment.areasForImprovement?.length) {
        doc.moveDown(0.3);
        doc.fillColor("#000").text("Areas de mejora:");
        journey.currentAssessment.areasForImprovement.forEach(area => {
          doc.text(`• ${area}`);
        });
      }

      // Journey Phases
      journey.phases?.forEach((phase, index) => {
        doc.moveDown(0.8);
        doc.fillColor(primaryColor).fontSize(14).text(`${index + 1}. ${phase.name} (${phase.duration})`, {
          underline: true
        });
        doc.moveDown(0.3);

        doc.fillColor("#000").fontSize(11);

        if (phase.goals?.length) {
          doc.text("Objetivos:");
          phase.goals.forEach(goal => {
            doc.text(`• ${goal}`);
          });
          doc.moveDown(0.2);
        }

        if (phase.actions?.length) {
          doc.text("Acciones:");
          phase.actions.forEach(action => {
            doc.text(`• ${action}`);
          });
          doc.moveDown(0.2);
        }

        if (phase.resources?.length) {
          doc.text("Recursos:");
          phase.resources.forEach(resource => {
            doc.text(`• ${resource}`);
          });
        }
      });

      doc.moveDown(0.8);
      doc.fillColor("#666").fontSize(10).text(
        "Este journey es una guia flexible. Adaptalo a tu ritmo y circunstancias personales.",
        { align: "center" }
      );
    }

    doc.moveDown(1);
    doc
      .fillColor("#000")
      .fontSize(10)
      .text(
        `Plan de estudios generado el ${new Date().toLocaleString()} con rutas de aprendizaje STEM personalizadas de Geek Girls LatAm.`,
        { align: "left" }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating PDF", error);
    res
      .status(500)
      .json({ message: "Error al generar el PDF.", detail: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`API Geek Girls LatAm ejecutándose en http://localhost:${PORT}`);
});

