import PropTypes from "prop-types";
import { Controller, useForm } from "react-hook-form";
import {
  ageRangeOptions,
  educationLevels,
  techAreas,
  motivationOptions,
  technicalSkillOptions,
  languageToolOptions,
  englishLevels,
  softSkillOptions,
  experienceYearsOptions,
  workPreferenceOptions,
  companyPreferenceOptions,
  salaryExpectationOptions,
  learningStyleOptions,
  learningTopicsOptions,
  expectationOptions,
  confidenceLevelOptions,
  mentorshipOptions
} from "../constants/formOptions";

const defaultValues = {
  fullName: "",
  email: "",
  ageRange: "",
  country: "",
  program: "",
  graduationYear: "",
  educationLevel: "",
  primaryArea: "",
  experienceYears: "",
  techInterests: [],
  techInterestsOther: "",
  motivations: [],
  techSkills: [],
  techSkillsOther: "",
  workPreference: "",
  companyPreference: "",
  salaryExpectation: "",
  tools: [],
  toolsOther: "",
  englishLevel: "",
  softSkills: [],
  hasTechExperience: "No",
  experienceDetails: "",
  mentorshipInterest: "No",
  learningStyles: [],
  learningTopics: [],
  learningTopicsOther: "",
  impactStatement: "",
  confidenceLevel: "",
  expectations: [],
  expectationOther: ""
};

const requiredMessage = "Este campo es obligatorio.";

function normalizeOptions(options) {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );
}

function ProfileForm({ onSubmit, loading }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues
  });

  const hasTechExperience = watch("hasTechExperience");

  const sanitizedSubmit = (values) => {
    const {
      techInterestsOther,
      techSkillsOther,
      toolsOther,
      learningTopicsOther,
      expectationOther,
      ...rest
    } = values;

    const mergeOther = (list, otherValue) => {
      const filtered = list.filter((item) => item !== "Otro" && item !== "Otros");
      if (list.includes("Otro") || list.includes("Otros")) {
        if (otherValue?.trim()) {
          filtered.push(otherValue.trim());
        }
      }
      return filtered;
    };

    const payload = {
      ...rest,
      techInterests: mergeOther(values.techInterests, techInterestsOther),
      techSkills: mergeOther(values.techSkills, techSkillsOther),
      tools: mergeOther(values.tools, toolsOther),
      learningTopics: mergeOther(values.learningTopics, learningTopicsOther),
      expectations: mergeOther(values.expectations, expectationOther)
    };

    if (payload.graduationYear) {
      payload.graduationYear = Number(payload.graduationYear);
    }

    if (payload.hasTechExperience === "No") {
      payload.experienceDetails = "";
    }

    onSubmit(payload, {
      reset: () => reset(defaultValues)
    });
  };

  const renderCheckboxGroup = ({
    name,
    label,
    options,
    helperText,
    required,
    otherFieldName,
    otherPlaceholder,
    columns = 2
  }) => (
    <Controller
      name={name}
      control={control}
      rules={
        required
          ? {
              validate: (value) =>
                value && value.length > 0 ? true : "Selecciona al menos una opción."
            }
          : undefined
      }
      render={({ field }) => {
        const normalized = normalizeOptions(options);
        const selectedValues = field.value || [];
        const showOtherInput =
          otherFieldName &&
          selectedValues.some(
            (val) =>
              val.toLowerCase() === "otro" ||
              val.toLowerCase() === "otros" ||
              val.toLowerCase().includes("otro")
          );

        const handleCheckboxChange = (checked, value) => {
          if (checked) {
            field.onChange([...selectedValues, value]);
          } else {
            field.onChange(selectedValues.filter((item) => item !== value));
          }
        };

        return (
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-lg font-semibold text-brand-primary">
                  {label}
                </label>
                {required ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
                    Obligatorio
                  </span>
                ) : null}
              </div>
              {helperText ? (
                <p className="text-sm text-slate-600">{helperText}</p>
              ) : null}
            </div>
            <div
              className={`grid gap-3 ${columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
            >
              {normalized.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-secondary/60 hover:shadow-md ${
                    selectedValues.includes(option.value)
                      ? "border-brand-secondary bg-brand-secondary/5"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-brand-primary text-brand-secondary focus:ring-brand-secondary"
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    onChange={(event) =>
                      handleCheckboxChange(event.target.checked, option.value)
                    }
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
            {showOtherInput ? (
              <input
                type="text"
                placeholder={otherPlaceholder || "Especifica"}
                {...register(otherFieldName)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              />
            ) : null}
            {errors[name] ? (
              <p className="text-sm text-rose-600">{errors[name].message}</p>
            ) : null}
          </div>
        );
      }}
    />
  );

  const sectionClass =
    "rounded-3xl bg-white p-8 shadow-soft ring-1 ring-brand-primary/5 space-y-6";

  return (
    <form
      onSubmit={handleSubmit(sanitizedSubmit)}
      className="space-y-10"
      noValidate
    >
      <section className={sectionClass}>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Sección 1
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Información general
          </h2>
          <p className="text-sm text-slate-600">
            Esta información nos ayuda a contextualizar tu perfil y a segmentar las
            recomendaciones.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Nombre completo</label>
            <input
              type="text"
              {...register("fullName", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              placeholder="Ej. María Pérez"
            />
            {errors.fullName ? (
              <p className="text-sm text-rose-600">{errors.fullName.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
            <input
              type="email"
              {...register("email", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              placeholder="nombre@correo.com"
            />
            {errors.email ? (
              <p className="text-sm text-rose-600">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Edad (rango)</label>
            <select
              {...register("ageRange", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
            >
              <option value="">Selecciona una opción</option>
              {ageRangeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.ageRange ? (
              <p className="text-sm text-rose-600">{errors.ageRange.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              País o región de residencia
            </label>
            <input
              type="text"
              {...register("country", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              placeholder="Ej. Colombia"
            />
            {errors.country ? (
              <p className="text-sm text-rose-600">{errors.country.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Programa o curso de Geek Girls LatAm
            </label>
            <input
              type="text"
              {...register("program", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              placeholder="Nombre del programa"
            />
            {errors.program ? (
              <p className="text-sm text-rose-600">{errors.program.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Año de egreso</label>
            <input
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              {...register("graduationYear", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              placeholder="Ej. 2024"
            />
            {errors.graduationYear ? (
              <p className="text-sm text-rose-600">{errors.graduationYear.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Nivel de formación</label>
            <select
              {...register("educationLevel", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
            >
              <option value="">Selecciona una opción</option>
              {educationLevels.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.educationLevel ? (
              <p className="text-sm text-rose-600">{errors.educationLevel.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Área de conocimiento principal
            </label>
            <select
              {...register("primaryArea", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
            >
              <option value="">Selecciona una opción</option>
              {techAreas.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.primaryArea ? (
              <p className="text-sm text-rose-600">{errors.primaryArea.message}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Sección 2
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Intereses profesionales
          </h2>
          <p className="text-sm text-slate-600">
            Cuéntanos hacia dónde quieres proyectarte profesionalmente.
          </p>
        </header>
        <div className="space-y-8">
          {renderCheckboxGroup({
            name: "techInterests",
            label: "Áreas de tecnología que te interesan",
            options: techAreas,
            helperText: "Selecciona todas las que apliquen a tus intereses.",
            required: true,
            otherFieldName: "techInterestsOther",
            otherPlaceholder: "¿Cuál otra área te interesa?"
          })}
          {renderCheckboxGroup({
            name: "motivations",
            label: "¿Qué te motiva más en tu carrera profesional?",
            options: motivationOptions,
            helperText: "Selecciona una o varias motivaciones que te representen.",
            required: true
          })}
        </div>
      </section>

      <section className={sectionClass}>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Sección 4
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Habilidades técnicas y blandas
          </h2>
          <p className="text-sm text-slate-600">
            Identifica tus fortalezas actuales y posibles oportunidades de mejora.
          </p>
        </header>
        <div className="space-y-8">
          {renderCheckboxGroup({
            name: "techSkills",
            label: "Habilidades técnicas principales",
            options: technicalSkillOptions,
            helperText: "Selecciona las tecnologías y herramientas que dominas.",
            required: true,
            otherFieldName: "techSkillsOther",
            otherPlaceholder: "Describe otras habilidades técnicas"
          })}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Nivel de inglés
              </label>
              <select
                {...register("englishLevel", { required: requiredMessage })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              >
                <option value="">Selecciona una opción</option>
                {englishLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.englishLevel ? (
                <p className="text-sm text-rose-600">{errors.englishLevel.message}</p>
              ) : null}
            </div>
          </div>
          {renderCheckboxGroup({
            name: "softSkills",
            label: "Habilidades blandas con las que te identificas",
            options: softSkillOptions,
            helperText: "Selecciona al menos una habilidad blanda.",
            required: true,
            columns: 3
          })}
        </div>
      </section>

      <section className={sectionClass}>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Sección 3
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Experiencia actual
          </h2>
          <p className="text-sm text-slate-600">
            Cuéntanos sobre tu experiencia previa para personalizar mejor tus recomendaciones.
          </p>
        </header>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                ¿Cuántos años de experiencia tienes en tecnología?
              </label>
              <select
                {...register("experienceYears", { required: requiredMessage })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              >
                <option value="">Selecciona una opción</option>
                {experienceYearsOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.experienceYears ? (
                <p className="text-sm text-rose-600">{errors.experienceYears.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                ¿Tienes experiencia laboral en tecnología?
              </label>
              <select
                {...register("hasTechExperience", { required: requiredMessage })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              >
                <option value="No">No, pero estoy en transición</option>
                <option value="Sí">Sí, tengo experiencia laboral</option>
              </select>
            </div>
          </div>
          {hasTechExperience === "Sí" ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Describe tu experiencia (cargo y tiempo)
              </label>
              <textarea
                rows={3}
                {...register("experienceDetails", { required: requiredMessage })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
                placeholder="Ej. Desarrolladora Frontend en Startup X durante 2 años."
              />
              {errors.experienceDetails ? (
                <p className="text-sm text-rose-600">{errors.experienceDetails.message}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className={sectionClass}>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Sección 5
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Aspiraciones profesionales
          </h2>
          <p className="text-sm text-slate-600">
            Cuéntanos sobre tus objetivos profesionales para contextualizar mejor tus recomendaciones.
          </p>
        </header>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                ¿Qué tipo de empleo te gustaría tener?
              </label>
              <select
                {...register("workPreference", { required: requiredMessage })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              >
                <option value="">Selecciona una opción</option>
                {workPreferenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.workPreference ? (
                <p className="text-sm text-rose-600">{errors.workPreference.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                ¿En qué tipo de empresa te gustaría trabajar?
              </label>
              <select
                {...register("companyPreference", { required: requiredMessage })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              >
                <option value="">Selecciona una opción</option>
                {companyPreferenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.companyPreference ? (
                <p className="text-sm text-rose-600">
                  {errors.companyPreference.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2 md:w-1/2">
            <label className="text-sm font-medium text-slate-700">
              ¿Qué rango salarial esperas alcanzar en los próximos 2 años?
            </label>
            <select
              {...register("salaryExpectation", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
            >
              <option value="">Selecciona una opción</option>
              {salaryExpectationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.salaryExpectation ? (
              <p className="text-sm text-rose-600">{errors.salaryExpectation.message}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Sección 6
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Preferencias de aprendizaje y expectativas
          </h2>
          <p className="text-sm text-slate-600">
            Cuéntanos cómo prefieres aprender y qué esperas obtener de este proceso.
          </p>
        </header>
        <div className="space-y-8">
          <div className="space-y-4">
            {renderCheckboxGroup({
              name: "learningStyles",
              label: "¿Cómo prefieres seguir aprendiendo?",
              options: learningStyleOptions,
              helperText: "Selecciona uno o varios estilos de aprendizaje.",
              required: true
            })}
          </div>
          {renderCheckboxGroup({
            name: "learningTopics",
            label: "¿Qué temas te gustaría fortalecer?",
            options: learningTopicsOptions,
            helperText: "Selecciona los temas prioritarios para tu desarrollo.",
            required: true,
            otherFieldName: "learningTopicsOther",
            otherPlaceholder: "Añade otro tema de interés"
          })}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                ¿Te interesa recibir mentoría en empleabilidad?
              </label>
              <select
                {...register("mentorshipInterest", { required: requiredMessage })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              >
                <option value="">Selecciona una opción</option>
                {mentorshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.mentorshipInterest ? (
                <p className="text-sm text-rose-600">
                  {errors.mentorshipInterest.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                ¿Qué tan segura te sientes de tu perfil actual?
              </label>
              <select
                {...register("confidenceLevel", { required: requiredMessage })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              >
                <option value="">Selecciona una opción</option>
                {confidenceLevelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.confidenceLevel ? (
                <p className="text-sm text-rose-600">
                  {errors.confidenceLevel.message}
                </p>
              ) : null}
            </div>
          </div>
          {renderCheckboxGroup({
            name: "tools",
            label: "¿Qué herramientas o lenguajes usas con más frecuencia?",
            options: languageToolOptions,
            helperText: "Elige las herramientas que utilizas habitualmente.",
            required: true,
            otherFieldName: "toolsOther",
            otherPlaceholder: "Añade otra herramienta o lenguaje"
          })}
          <div className="space-y-3">
            {renderCheckboxGroup({
              name: "expectations",
              label: "¿Qué esperas obtener de este análisis?",
              options: expectationOptions,
              helperText: "Selecciona tus principales expectativas.",
              required: true,
              otherFieldName: "expectationOther",
              otherPlaceholder: "Comparte otra expectativa"
            })}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              ¿Cómo te gustaría que tu carrera impacte en tu comunidad?
            </label>
            <textarea
              rows={3}
              {...register("impactStatement", { required: requiredMessage })}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
              placeholder="Comparte tu visión de impacto social"
            />
            {errors.impactStatement ? (
              <p className="text-sm text-rose-600">{errors.impactStatement.message}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Sección 7
          </p>
          <h2 className="text-2xl font-bold text-brand-primary">
            Oportunidades laborales
          </h2>
          <p className="text-sm text-slate-600">
            Al completar estas rutas de aprendizaje, podrás acceder a posiciones como estas.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">💻</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Desarrollo Web</h3>
                <p className="text-xs text-blue-700">Frontend/Backend</p>
              </div>
            </div>
            <p className="text-sm text-blue-800 mb-2">
              Desarrolladora Full-Stack, Ingeniera Frontend, Arquitecta Web
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">React</span>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Node.js</span>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">$2k-5k</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Análisis de Datos</h3>
                <p className="text-xs text-green-700">Data Science</p>
              </div>
            </div>
            <p className="text-sm text-green-800 mb-2">
              Analista de Datos, Científica de Datos, BI Developer
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Python</span>
              <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">SQL</span>
              <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">$2.5k-6k</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎨</span>
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Diseño UX/UI</h3>
                <p className="text-xs text-purple-700">Product Design</p>
              </div>
            </div>
            <p className="text-sm text-purple-800 mb-2">
              Diseñadora UX, Product Designer, UI Developer
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">Figma</span>
              <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">Design</span>
              <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">$2k-4.5k</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔒</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Ciberseguridad</h3>
                <p className="text-xs text-red-700">Security</p>
              </div>
            </div>
            <p className="text-sm text-red-800 mb-2">
              Analista de Seguridad, Ethical Hacker, Security Engineer
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">Security</span>
              <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">Python</span>
              <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">$3k-7k</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">🚀</span>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900">Ciencia de Datos</h3>
                <p className="text-xs text-yellow-700">AI/ML</p>
              </div>
            </div>
            <p className="text-sm text-yellow-800 mb-2">
              Científica de Datos, ML Engineer, AI Researcher
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">Python</span>
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">ML</span>
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">$3.5k-8k</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 border border-indigo-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">📈</span>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">Product Management</h3>
                <p className="text-xs text-indigo-700">Product</p>
              </div>
            </div>
            <p className="text-sm text-indigo-800 mb-2">
              Product Manager, Associate PM, Product Owner
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded-full">Strategy</span>
              <span className="px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded-full">Agile</span>
              <span className="px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded-full">$3k-6k</span>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 p-4 border border-brand-primary/20">
          <p className="text-sm text-brand-primary text-center">
            <strong>💡 Recuerda:</strong> Estas son solo algunas de las oportunidades disponibles.
            Cada ruta de aprendizaje te abre puertas a múltiples carreras STEM con alto impacto y crecimiento profesional.
          </p>
        </div>
      </section>

      <footer className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-r from-brand-primary to-brand-secondary px-8 py-6 text-white md:flex-row md:items-center">
        <div>
          <h3 className="text-xl font-semibold">¿Lista para descubrir tu ruta de aprendizaje?</h3>
          <p className="text-sm text-white/80">
            Al enviar tus respuestas, generaremos rutas de aprendizaje personalizadas y un
            plan de estudios completo.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-primary shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Analizando perfil..." : "Generar rutas de aprendizaje"}
        </button>
      </footer>
    </form>
  );
}

ProfileForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

ProfileForm.defaultProps = {
  loading: false
};

export default ProfileForm;

