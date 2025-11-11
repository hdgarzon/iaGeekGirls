import PropTypes from "prop-types";

function MatchResults({
  profile,
  recommendations,
  journey,
  onDownloadPdf,
  onReset,
  pdfLoading = false
}) {
  if (!recommendations?.length) {
    return null;
  }

  const formatScore = (score) => Math.round((score || 0) * 100);

  return (
    <section className="space-y-6 rounded-3xl bg-white p-8 shadow-soft ring-1 ring-brand-primary/5">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Recomendaciones IA
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Tus Top 3 rutas de aprendizaje STEM
          </h2>
          <p className="text-sm text-slate-600">
            Basado en tu perfil, experiencia y objetivos. Revisa cada ruta y
            descarga tu plan de estudios personalizado.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
          >
            Nueva evaluación
          </button>
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={pdfLoading}
            className="flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pdfLoading ? "Generando plan de estudios..." : "Descargar plan de estudios PDF"}
          </button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {recommendations.map((rec, index) => (
          <article
            key={rec.id}
            className="gradient-card flex flex-col justify-between rounded-3xl border border-white/40 bg-white/80 p-6 shadow-soft backdrop-blur-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-secondary">
                  Ruta #{index + 1}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  rec.level === 'beginner' ? 'bg-green-100 text-green-800' :
                  rec.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {rec.level === 'beginner' ? 'Principiante' :
                   rec.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-brand-primary">{rec.title}</h3>
              <p className="text-sm font-medium text-brand-secondary">{rec.area}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 overflow-hidden rounded-full bg-brand-primary/10">
                  <div
                    className="h-2 rounded-full bg-brand-secondary transition-all"
                    style={{ width: `${formatScore(rec.score)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-brand-primary">
                  {formatScore(rec.score)}%
                </span>
              </div>
              <p className="text-sm text-slate-600">{rec.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>⏱️ {rec.duration}</span>
                <span>📚 {rec.modules?.length || 0} módulos</span>
              </div>
              {rec.prerequisites?.length ? (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Prerrequisitos
                  </h4>
                  <p className="text-sm text-slate-600">
                    {rec.prerequisites.join(", ")}
                  </p>
                </div>
              ) : null}
              {rec.careerOutcomes?.length ? (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
                    Carreras posibles
                  </h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {rec.careerOutcomes.slice(0, 3).map((outcome) => (
                      <span
                        key={outcome}
                        className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {rec.rationale ? (
                <p className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600 shadow-inner">
                  {rec.rationale}
                </p>
              ) : null}
            </div>
            <footer className="mt-6 space-y-2 text-xs text-slate-500">
              <p className="font-medium text-brand-primary">
                Fuente:{" "}
                {rec.sourceUrl ? (
                  <a
                    href={rec.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-secondary underline decoration-brand-secondary/40 hover:decoration-brand-secondary"
                  >
                    {rec.source}
                  </a>
                ) : (
                  <span>{rec.source}</span>
                )}
              </p>
              <p>Actualizado: {new Date(rec.lastUpdated).toLocaleDateString()}</p>
            </footer>
          </article>
        ))}
      </div>

      {journey && (
        <section className="space-y-6 rounded-3xl bg-gradient-to-br from-brand-secondary/10 to-brand-primary/10 p-8 shadow-soft ring-1 ring-brand-primary/5">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
              Journey de Aprendizaje
            </p>
            <h2 className="text-2xl font-bold text-brand-primary">
              Tu ruta hacia el dominio STEM
            </h2>
            <p className="text-sm text-slate-600">
              Plan personalizado de aprendizaje STEM basado en tu perfil y objetivos.
            </p>
          </header>

          {/* Current Assessment */}
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-brand-primary mb-4">
              📊 Evaluación Actual
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-brand-secondary mb-2">💪 Fortalezas</h4>
                <div className="flex flex-wrap gap-2">
                  {journey.currentAssessment.strengths.map((strength) => (
                    <span
                      key={strength}
                      className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">🎯 Áreas de Mejora</h4>
                <div className="flex flex-wrap gap-2">
                  {journey.currentAssessment.areasForImprovement.map((area) => (
                    <span
                      key={area}
                      className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Nivel actual: <span className="font-semibold capitalize">{journey.currentAssessment.learningLevel}</span>
            </p>
          </div>

          {/* Journey Phases */}
          <div className="space-y-4">
            {journey.phases.map((phase, index) => (
              <div
                key={index}
                className="rounded-3xl bg-white p-6 shadow-soft border-l-4 border-brand-secondary"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-brand-primary">
                      {phase.name}
                    </h3>
                    <p className="text-sm text-slate-600">{phase.duration}</p>
                  </div>
                  <span className="rounded-full bg-brand-secondary/10 px-3 py-1 text-xs font-semibold text-brand-secondary">
                    Fase {index + 1}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-semibold text-brand-primary mb-2">🎯 Objetivos</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {phase.goals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-brand-secondary mt-1">•</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-brand-primary mb-2">🚀 Acciones</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {phase.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-brand-secondary mt-1">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-brand-primary mb-2">📚 Recursos</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {phase.resources.map((resource, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-brand-secondary mt-1">•</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-brand-primary/5 p-6 text-center">
            <p className="text-sm text-brand-primary">
              💡 <strong>Recuerda:</strong> Este journey es una guía flexible. Adáptalo a tu ritmo y circunstancias personales.
              El crecimiento profesional es un viaje continuo.
            </p>
          </div>
        </section>
      )}

      {/* Career Opportunities Section */}
      <section className="space-y-6 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 p-8 shadow-soft ring-1 ring-brand-primary/5">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Oportunidades Laborales
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Carreras que puedes alcanzar
          </h2>
          <p className="text-sm text-slate-600">
            Al completar estas rutas de aprendizaje, podrás acceder a posiciones como estas en el mercado STEM.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">💻</span>
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Desarrollo Web</h3>
                <p className="text-sm text-blue-700">Frontend/Backend</p>
              </div>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Desarrolladora Full-Stack, Ingeniera Frontend, Arquitecta Web, DevOps Engineer
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">React</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Node.js</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Python</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-900">$2,000 - $5,000 USD</span>
              <span className="text-xs text-blue-600">Entry-Mid Level</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-green-900">Análisis de Datos</h3>
                <p className="text-sm text-green-700">Data Science</p>
              </div>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Analista de Datos, Business Intelligence, Data Engineer, BI Developer
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">Python</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">SQL</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">Tableau</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-900">$2,500 - $6,000 USD</span>
              <span className="text-xs text-green-600">Entry-Mid Level</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 border border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">🎨</span>
              </div>
              <div>
                <h3 className="font-bold text-purple-900">Diseño UX/UI</h3>
                <p className="text-sm text-purple-700">Product Design</p>
              </div>
            </div>
            <p className="text-sm text-purple-800 mb-3">
              Diseñadora UX, Product Designer, UI Developer, Design System Lead
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">Figma</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">Sketch</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">Design</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-900">$2,000 - $4,500 USD</span>
              <span className="text-xs text-purple-600">Entry-Mid Level</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-6 border border-red-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold">🔒</span>
              </div>
              <div>
                <h3 className="font-bold text-red-900">Ciberseguridad</h3>
                <p className="text-sm text-red-700">Security</p>
              </div>
            </div>
            <p className="text-sm text-red-800 mb-3">
              Analista de Seguridad, Ethical Hacker, Security Engineer, SOC Analyst
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-medium rounded-full">Python</span>
              <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-medium rounded-full">Security</span>
              <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-medium rounded-full">Linux</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-red-900">$3,000 - $7,000 USD</span>
              <span className="text-xs text-red-600">Mid-Senior Level</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 border border-yellow-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold">🚀</span>
              </div>
              <div>
                <h3 className="font-bold text-yellow-900">Ciencia de Datos</h3>
                <p className="text-sm text-yellow-700">AI/ML</p>
              </div>
            </div>
            <p className="text-sm text-yellow-800 mb-3">
              Científica de Datos, ML Engineer, AI Researcher, Data Scientist
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">Python</span>
              <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">TensorFlow</span>
              <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">ML</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-yellow-900">$3,500 - $8,000 USD</span>
              <span className="text-xs text-yellow-600">Mid-Senior Level</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 border border-indigo-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold">📈</span>
              </div>
              <div>
                <h3 className="font-bold text-indigo-900">Product Management</h3>
                <p className="text-sm text-indigo-700">Product</p>
              </div>
            </div>
            <p className="text-sm text-indigo-800 mb-3">
              Product Manager, Associate PM, Product Owner, Growth Hacker
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-full">Strategy</span>
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-full">Agile</span>
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-full">Analytics</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-indigo-900">$3,000 - $6,000 USD</span>
              <span className="text-xs text-indigo-600">Mid Level</span>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 p-6 border border-brand-primary/20">
          <div className="text-center">
            <h3 className="text-lg font-bold text-brand-primary mb-2">🎯 Tu futuro profesional te espera</h3>
            <p className="text-sm text-brand-primary mb-4">
              Estas rutas de aprendizaje están diseñadas para llevarte desde donde estás ahora hasta estas posiciones de alto impacto.
              Cada módulo, cada proyecto, cada certificación te acerca más a tu objetivo profesional.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Alta demanda laboral</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Salarios competitivos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span>Crecimiento profesional</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span>Impacto social positivo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-dashed border-brand-primary/30 bg-brand-primary/5 p-6 text-sm text-brand-primary">
        <h3 className="text-lg font-semibold text-brand-primary">
          Perfil de aprendizaje
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <p>
            <span className="font-semibold">Nombre:</span> {profile?.fullName}
          </p>
          <p>
            <span className="font-semibold">Área de interés:</span>{" "}
            {profile?.primaryArea}
          </p>
          <p>
            <span className="font-semibold">Experiencia previa:</span>{" "}
            {profile?.experienceYears} años
          </p>
          <p>
            <span className="font-semibold">Intereses STEM:</span>{" "}
            {profile?.techInterests?.slice(0, 3).join(", ")}
          </p>
          <p>
            <span className="font-semibold">Disponibilidad:</span>{" "}
            {profile?.workPreference}
          </p>
          <p>
            <span className="font-semibold">Objetivos:</span>{" "}
            {profile?.expectations?.slice(0, 2).join(", ")}
          </p>
        </div>
      </aside>
    </section>
  );
}

export default MatchResults;

MatchResults.propTypes = {
  profile: PropTypes.shape({
    fullName: PropTypes.string,
    primaryArea: PropTypes.string,
    experienceYears: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    techInterests: PropTypes.arrayOf(PropTypes.string),
    workPreference: PropTypes.string,
    expectations: PropTypes.arrayOf(PropTypes.string)
  }),
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      area: PropTypes.string,
      level: PropTypes.string,
      duration: PropTypes.string,
      description: PropTypes.string,
      prerequisites: PropTypes.arrayOf(PropTypes.string),
      modules: PropTypes.arrayOf(PropTypes.object),
      careerOutcomes: PropTypes.arrayOf(PropTypes.string),
      score: PropTypes.number,
      matchedSkills: PropTypes.arrayOf(PropTypes.string),
      missingSkills: PropTypes.arrayOf(PropTypes.string),
      rationale: PropTypes.string,
      source: PropTypes.string,
      sourceUrl: PropTypes.string,
      lastUpdated: PropTypes.string
    })
  ).isRequired,
  journey: PropTypes.shape({
    currentAssessment: PropTypes.shape({
      strengths: PropTypes.arrayOf(PropTypes.string),
      areasForImprovement: PropTypes.arrayOf(PropTypes.string),
      learningLevel: PropTypes.string
    }),
    phases: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        duration: PropTypes.string,
        goals: PropTypes.arrayOf(PropTypes.string),
        actions: PropTypes.arrayOf(PropTypes.string),
        resources: PropTypes.arrayOf(PropTypes.string)
      })
    )
  }),
  onDownloadPdf: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  pdfLoading: PropTypes.bool
};

MatchResults.defaultProps = {
  profile: null,
  pdfLoading: false
};

