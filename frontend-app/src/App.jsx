import { useState } from "react";
import ProfileForm from "./components/ProfileForm";
import MatchResults from "./components/MatchResults";
import {
  downloadMatchPdf,
  generateMatchRequest
} from "./services/profileService";

function App() {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
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
      setMatches(data.matches || []);
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
    if (!profile || !matches.length) return;

    try {
      setPdfLoading(true);
      const blob = await downloadMatchPdf({ profile, matches });
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
    setMatches([]);
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
            Análisis de perfil y match laboral para egresadas STEM
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-white/80 md:text-base">
            Completa el formulario de orientación profesional, nuestra IA analizará tus
            habilidades y aspiraciones, y te recomendará roles del mercado laboral
            acordes a tu perfil. Obtén un reporte PDF personalizado para tu seguimiento.
          </p>
          <ul className="mt-6 grid gap-3 text-sm md:grid-cols-3">
            <li className="rounded-2xl bg-white/10 p-4">
              <span className="font-semibold">Formulario integral</span>
              <p className="text-white/75">
                Información general, intereses, habilidades y aspiraciones en un solo lugar.
              </p>
            </li>
            <li className="rounded-2xl bg-white/10 p-4">
              <span className="font-semibold">Matching con IA</span>
              <p className="text-white/75">
                Embeddings y similitud con datasets y APIs externas del mercado laboral.
              </p>
            </li>
            <li className="rounded-2xl bg-white/10 p-4">
              <span className="font-semibold">Reporte descargable</span>
              <p className="text-white/75">
                PDF con tus recomendaciones, habilidades destacadas y sugerencias.
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

        {profile && !matches.length && !loading ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-700">
            No encontramos coincidencias directas con el dataset actual. Revisa tus
            intereses o habilidades clave y vuelve a intentarlo; también puedes añadir más
            fuentes externas en el backend.
          </div>
        ) : null}

        {matches.length ? (
          <MatchResults
            profile={profile}
            matches={matches}
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
