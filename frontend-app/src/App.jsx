import { useState } from "react";
import ProfileForm from "./components/ProfileForm";
import MatchResults from "./components/MatchResults";
import {
  downloadMatchPdf,
  generateMatchRequest
} from "./services/profileService";

function App() {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [journey, setJourney] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFormSubmit = async (formValues) => {
    try {
      setLoading(true);
      setError("");
      const data = await generateMatchRequest({
        profile: formValues,
        persist: true
      });
      setProfile(data.profile);
      setRecommendations(data.recommendations || []);
      setJourney(data.journey || null);
      setMetadata(data.metadata || null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        "No pudimos analizar tu perfil en este momento. Intenta nuevamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!profile || !recommendations.length) return;

    try {
      setPdfLoading(true);
      const blob = await downloadMatchPdf({ profile, recommendations, journey });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `geek-girls-latam-match-${profile.fullName
        ?.toLowerCase()
        .replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF", err);
      const message =
        err.response?.data?.message ||
        "No fue posible generar el PDF. Intenta más tarde.";
      setError(message);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleReset = () => {
    setProfile(null);
    setRecommendations([]);
    setJourney(null);
    setMetadata(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-brand-background pb-20">
      <main className="container space-y-12 py-12">
        <section className="rounded-3xl bg-gradient-to-r from-brand-primary via-brand-primary/90 to-brand-secondary/80 p-10 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            Geek Girls LatAm · Proyecto IA
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            Rutas Personalizadas de Aprendizaje STEM
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-white/80 md:text-base">
            Completa el formulario de orientación educativa, nuestra IA analizará tu perfil
            y experiencia, y te recomendará rutas de aprendizaje STEM personalizadas para
            tu crecimiento profesional. Obtén un plan de estudios completo con recursos.
          </p>
          <ul className="mt-6 grid gap-3 text-sm md:grid-cols-3">
            <li className="rounded-2xl bg-white/10 p-4">
              <span className="font-semibold">Evaluación personalizada</span>
              <p className="text-white/75">
                Análisis de tu nivel actual, intereses y experiencia previa.
              </p>
            </li>
            <li className="rounded-2xl bg-white/10 p-4">
              <span className="font-semibold">Rutas de aprendizaje IA</span>
              <p className="text-white/75">
                Recomendaciones inteligentes de caminos STEM basados en tu perfil.
              </p>
            </li>
            <li className="rounded-2xl bg-white/10 p-4">
              <span className="font-semibold">Plan educativo completo</span>
              <p className="text-white/75">
                Módulos secuenciales, recursos y cronograma de aprendizaje.
              </p>
            </li>
          </ul>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700">
            {error}
          </div>
        ) : null}

        <ProfileForm onSubmit={handleFormSubmit} loading={loading} />

        {profile && !recommendations.length && !loading ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-700">
            No encontramos rutas de aprendizaje que coincidan perfectamente con tu perfil.
            Considera ajustar tus intereses o experiencia, o explora rutas de nivel básico
            si estás empezando en STEM.
          </div>
        ) : null}

        {recommendations.length ? (
          <MatchResults
            profile={profile}
            recommendations={recommendations}
            journey={journey}
            onDownloadPdf={handleDownloadPdf}
            onReset={handleReset}
            pdfLoading={pdfLoading}
          />
        ) : null}

        {metadata ? (
          <div className="rounded-2xl border border-brand-primary/10 bg-white/70 p-6 text-xs text-brand-primary">
            <p>
              <span className="font-semibold">Coincidencias evaluadas:</span>{" "}
              {metadata.totalCandidates}
            </p>
            <p>
              <span className="font-semibold">Fecha de análisis:</span>{" "}
              {new Date(metadata.generatedAt).toLocaleString()}
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
