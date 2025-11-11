## Geek Girls LatAm – Match de Perfil Laboral con IA

Plataforma web que guía a las egresadas de Geek Girls LatAm hacia rutas profesionales STEM. El flujo conecta un formulario integral, un backend con motor de matching basado en similitud semántica y generación de reportes PDF listos para compartir.

### 🌐 Estructura del repositorio

- `backend/` – API Express (Node.js) que recibe perfiles, consulta fuentes externas/datasets, calcula compatibilidades y genera PDFs con PDFKit.
- `frontend-app/` – SPA React + Tailwind que contiene el formulario, resultados de IA, descarga de PDF y estilo institucional.
- `npm-cache/` – Carpeta auxiliar para instalaciones locales (puede eliminarse en despliegues).

### ✨ Características clave

- **Formulario de orientación profesional** dividido en 6 secciones con validaciones obligatorias.
- **Motor de match** que compara perfiles contra roles de un dataset consolidado y fuentes públicas (Adzuna, Remotive, etc.).
- **Recomendaciones explicables** con porcentaje de ajuste, habilidades coincidentes y sugerencias de mejora.
- **Reporte PDF institucional** con colores Geek Girls LatAm (`#34267E` y `#FF0084`), resumen del perfil y matches destacados.
- **Persistencia temporal** de perfiles en memoria para pruebas rápidas (puede extenderse a Supabase/Firestore).

### 🧰 Stack principal

| Capa      | Tecnología                                                        |
|-----------|-------------------------------------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS 3, React Hook Form, Axios             |
| Backend   | Node 20+, Express 5, Axios, PDFKit                                |
| Matching  | Tokenización + similitud coseno (lista para reemplazar por embeddings) |
| Automatización | Endpoints listos para integrarse con Make/Zapier o cron jobs |

### 🚀 Puesta en marcha

Requisitos: Node.js >= 18, npm >= 9.

#### Variables de entorno

- Frontend: duplica uno de los templates y nómbralo según el modo de ejecución.
  ```bash
  cd frontend-app
  cp env-templates/development.env .env.development
  cp env-templates/production.env .env.production  # ajusta la URL del backend según corresponda
  ```

- Backend: copia el template al archivo `.env` del ambiente donde lo vayas a ejecutar.
  ```bash
  cd backend
  cp env-templates/development.env .env        # para desarrollo local
  cp env-templates/production.env .env         # ajusta y súbelo al servidor
  ```

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   > Nota: si tu entorno define `NODE_ENV=production`, ejecuta `npm install --include=dev` para instalar dependencias de desarrollo (PDFKit, etc.).
   Variables opcionales:
   ```
   PORT=4000
   ADZUNA_APP_ID=<tu_app_id>
   ADZUNA_API_KEY=<tu_api_key>
   ```
   > Sin credenciales, la API usa datasets locales y maneja gracefully los fallos externos.

2. **Frontend**
   ```bash
   cd frontend-app
   npm install
   npm run dev
   ```
   > En entornos con `NODE_ENV=production`, usa `npm install --include=dev` para asegurar la instalación de Tailwind y ESLint.
   Configura `VITE_API_BASE_URL` si el backend corre en otra URL (por defecto `http://localhost:4000`).

### 🔌 Endpoints principales

| Método | Ruta         | Descripción                                                                 |
|--------|--------------|-----------------------------------------------------------------------------|
| `GET`  | `/health`    | Ping de estado de la API.                                                   |
| `POST` | `/api/profiles` | Guarda un perfil y devuelve el registro creado.                          |
| `PUT`  | `/api/profiles/:id` | Actualiza un perfil existente.                                      |
| `GET`  | `/api/profiles` | Lista perfiles cargados (útil para panel administrativo).               |
| `POST` | `/api/match` | Genera coincidencias (`top 3`) contra dataset + APIs externas.             |
| `POST` | `/api/pdf`   | Genera y devuelve un PDF con resumen del perfil y recomendaciones.         |

### 🧠 Motor de matching

1. **Normalización de texto**: se combinan respuestas clave del formulario en un documento del perfil.
2. **Vectorización**: se construyen mapas de frecuencia por token (puede sustituirse por embeddings de OpenAI o `sentence-transformers` sin afectar el contrato).
3. **Similitud de coseno**: se recorren roles internos + trabajos externos (`Promise.allSettled` para manejar errores) y se calculan puntuaciones.
4. **Explicabilidad**: por cada match se calculan habilidades coincidentes, brechas y un racional en texto natural.

> La carpeta `backend/src/data/` incluye `rolesDataset.json` y `externalJobsSample.json` como punto de partida. Reemplázalos o enriquece la fuente desde pipelines ETL reales.

### 📄 Reporte PDF

- Encabezado institucional con tipografía sans-serif y gradiente de marca.
- Secciones: resumen del perfil, top matches, recomendaciones, fuentes de datos y fecha.
- Generado con PDFKit; la respuesta HTTP incluye `Content-Disposition: attachment`.

### 🖼️ Frontend

- Formulario validado (React Hook Form) con estados visuales, tooltips y campos “Otro”.
- Resultados en tarjetas animadas con barras de progreso y etiquetas de habilidades.
- Descarga directa del PDF y botón para reiniciar el flujo.
- Todo el diseño respeta la guía cromática de Geek Girls LatAm.

### 📊 Extensiones sugeridas

- Persistir perfiles y métricas en Supabase/Firestore.
- Integrar un orquestador (Make, Zapier) para enviar emails con el PDF generado.
- Reemplazar tokenización local por embeddings reales + base vectorial (Pinecone, PGVector, etc.).
- Construir dashboard administrativo (`Fase 7`) con D3/Plotly + endpoints agregados.

### ✅ Próximos pasos

1. Ajustar el dataset con información propia o fuentes oficiales actualizadas.
2. Añadir autenticación y consentimiento explícito conforme a Habeas Data/GDPR.
3. Automatizar despliegues (Railway/Render para backend y Vercel/Netlify para frontend).

---

Si necesitas que el agente genere código adicional, conecte nuevas APIs o prepare despliegues automatizados, indícalo en tu próximo mensaje. ¡Vamos a llevar el match laboral de las Geek Girls al siguiente nivel! 💜🚀

