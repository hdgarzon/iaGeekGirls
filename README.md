## Geek Girls LatAm – Rutas Personalizadas de Aprendizaje STEM con IA

Plataforma web que guía a las beneficiarias de Geek Girls LatAm hacia rutas de aprendizaje STEM personalizadas. El flujo conecta un formulario de evaluación, un backend con motor de recomendación de rutas de aprendizaje basado en similitud semántica y generación de planes de estudio PDF personalizados.

### 🌐 Estructura del repositorio

- `backend/` – API Express (Node.js) que recibe perfiles, consulta fuentes externas/datasets, calcula compatibilidades y genera PDFs con PDFKit.
- `frontend-app/` – SPA React + Tailwind que contiene el formulario, resultados de IA, descarga de PDF y estilo institucional.
- `npm-cache/` – Carpeta auxiliar para instalaciones locales (puede eliminarse en despliegues).

### ✨ Características clave

- **Formulario de evaluación educativa** dividido en secciones que capturan intereses, experiencia y objetivos de aprendizaje.
- **Motor de recomendación de rutas** que sugiere caminos de aprendizaje STEM personalizados basados en el perfil de la beneficiaria.
- **Rutas de aprendizaje estructuradas** con módulos secuenciales, recursos recomendados y cronogramas realistas.
- **Journey de aprendizaje personalizado** con 4 fases de desarrollo profesional desde principiante hasta experta.
- **Plan de estudios PDF** con colores Geek Girls LatAm (`#34267E` y `#FF0084`), evaluación del perfil, rutas recomendadas y journey completo.
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
| `POST` | `/api/match` | Genera recomendaciones de rutas de aprendizaje (`top 3`) personalizadas.    |
| `POST` | `/api/pdf`   | Genera y devuelve un PDF con plan de estudios completo y journey.           |

### 🧠 Motor de recomendación de rutas

1. **Evaluación del perfil**: se analiza el nivel de aprendizaje actual, intereses y experiencia previa.
2. **Vectorización semántica**: se construyen mapas de frecuencia por token del perfil (puede sustituirse por embeddings de OpenAI o `sentence-transformers`).
3. **Recomendación inteligente**: se evalúan rutas de aprendizaje considerando nivel, intereses y prerrequisitos, calculando puntuaciones de afinidad.
4. **Journey personalizado**: se genera un plan de desarrollo en 4 fases con objetivos, acciones y recursos específicos.

> La carpeta `backend/src/data/` incluye `rolesDataset.json` (ahora convertido en rutas de aprendizaje) como punto de partida. Las rutas incluyen módulos secuenciales, recursos y cronogramas realistas.

### 📄 Plan de estudios PDF

- Encabezado institucional con tipografía sans-serif y gradiente de marca.
- Secciones: evaluación del perfil, rutas de aprendizaje recomendadas, journey completo en 4 fases, recursos específicos y cronograma.
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

1. **Enriquecer el dataset de rutas**: agregar más rutas de aprendizaje STEM con recursos actualizados y validados.
2. **Validar rutas con expertas**: asegurar que las rutas sean realistas y efectivas para el contexto latinoamericano.
3. **Añadir seguimiento de progreso**: permitir que las beneficiarias marquen módulos completados y den feedback.
4. **Integrar plataformas de aprendizaje**: conectar con Coursera, edX, Udemy para recursos específicos.
5. **Añadir autenticación y consentimiento** conforme a Habeas Data/GDPR.
6. **Automatizar despliegues** (Railway/Render para backend y Vercel/Netlify para frontend).

---

¡La transformación está completa! Ahora tienes un asistente de rutas de aprendizaje STEM personalizado que automatiza el proceso manual de orientación educativa de Geek Girls LatAm. El sistema genera planes de estudio completos con journey de 4 fases, evaluando el perfil de cada beneficiaria y recomendando el camino más adecuado para su desarrollo profesional en STEM. 💜🚀

