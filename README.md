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
- **Fuentes de datos confiables** con información actualizada de salarios, demanda laboral y recursos educativos validados.
- **Journey de aprendizaje personalizado** con 4 fases de desarrollo profesional desde principiante hasta experta.
- **Plan de estudios PDF** con colores Geek Girls LatAm (`#34267E` y `#FF0084`), evaluación del perfil, rutas recomendadas y journey completo.
- **APIs de recursos** para acceder a datos de mercado, educación y estadísticas laborales.
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

### 📊 Endpoints de recursos

| Método | Ruta                      | Descripción                                                                 |
|--------|---------------------------|-----------------------------------------------------------------------------|
| `GET`  | `/api/resources`          | Lista todas las fuentes de datos disponibles por carrera.                   |
| `GET`  | `/api/resources/:careerId`| Obtiene recursos completos para una carrera específica.                     |
| `GET`  | `/api/resources/:careerId/education` | Recursos educativos para una carrera.                               |
| `GET`  | `/api/resources/:careerId/salary` | Datos salariales y fuentes de información.                          |
| `GET`  | `/api/resources/:careerId/market` | Estadísticas de mercado y demanda laboral.                          |

**IDs de carreras disponibles:**
- `web-development` - Desarrollo Web Full-Stack
- `data-analysis` - Análisis de Datos
- `ux-design` - Diseño UX/UI
- `data-science` - Ciencia de Datos
- `cybersecurity` - Ciberseguridad
- `product-management` - Gestión de Producto

### 🧠 Motor de recomendación de rutas

1. **Evaluación del perfil**: se analiza el nivel de aprendizaje actual, intereses y experiencia previa.
2. **Vectorización semántica**: se construyen mapas de frecuencia por token del perfil (puede sustituirse por embeddings de OpenAI o `sentence-transformers`).
3. **Recomendación inteligente**: se evalúan rutas de aprendizaje considerando nivel, intereses y prerrequisitos, calculando puntuaciones de afinidad.
4. **Journey personalizado**: se genera un plan de desarrollo en 4 fases con objetivos, acciones y recursos específicos.

> La carpeta `backend/src/data/` incluye:
> - `rolesDataset.json`: Rutas de aprendizaje STEM estructuradas con módulos, recursos y proyectos.
> - `learningResources.json`: Fuentes confiables de datos salariales, demanda laboral y recursos educativos validados.

### 📚 Fuentes de datos confiables

El sistema incluye un repositorio completo de fuentes confiables para mantener actualizada la información de cada carrera STEM:

#### 💻 Desarrollo Web Full-Stack
- **Salarios**: Glassdoor LATAM, Indeed Analytics, LinkedIn Salary Insights
- **Educación**: MDN Web Docs, freeCodeCamp, The Odin Project
- **Estadísticas**: Stack Overflow Survey 2024 (+25% crecimiento)

#### 📊 Análisis de Datos
- **Salarios**: Levels.fyi, Kaggle Surveys
- **Educación**: Google Data Analytics Certificate, DataCamp, Coursera
- **Estadísticas**: World Economic Forum (+35% crecimiento)

#### 🎨 Diseño UX/UI
- **Salarios**: UXPA Salary Survey, Behance Jobs
- **Educación**: Google UX Design Certificate, Interaction Design Foundation
- **Estadísticas**: UXPA 2024 Survey (+18% crecimiento)

#### 🚀 Ciencia de Datos
- **Salarios**: Kaggle ML & DS Survey, Towards Data Science
- **Educación**: Andrew Ng's ML Course, Fast.ai, DeepLearning.AI
- **Estadísticas**: LinkedIn 2024 Report (+40% crecimiento)

#### 🔒 Ciberseguridad
- **Salarios**: ISC² Cybersecurity Workforce Study, CyberSeek
- **Educación**: Cybrary, TryHackMe, HackTheBox
- **Estadísticas**: ISC² 2024 (+32% crecimiento)

#### 📈 Gestión de Producto
- **Salarios**: Product School, Reforge Reports
- **Educación**: Product School, Reforge Programs, Mind the Product
- **Estadísticas**: Product School 2024 (+20% crecimiento)

#### 🔄 Monitoreo continuo
- **Stack Overflow Developer Survey** (anual)
- **GitHub Octoverse** (anual)
- **State of JS/CSS/HTML** (anual)
- **Newsletters**: Data Elixir, UX Magazine, CSS-Tricks

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

- **Mantenimiento de fuentes**: Sistema automatizado para actualizar datos salariales y de demanda laboral mensualmente.
- Persistir perfiles y métricas en Supabase/Firestore.
- Integrar un orquestador (Make, Zapier) para enviar emails con el PDF generado.
- Reemplazar tokenización local por embeddings reales + base vectorial (Pinecone, PGVector, etc.).
- Construir dashboard administrativo (`Fase 7`) con D3/Plotly + endpoints agregados.
- **Validación de recursos**: Sistema para verificar que los enlaces educativos sigan activos y actualizados.

### ✅ Próximos pasos

1. **Actualizar fuentes de datos**: Implementar sistema automatizado para mantener actualizados salarios y estadísticas laborales.
2. **Enriquecer el dataset de rutas**: agregar más rutas de aprendizaje STEM con recursos actualizados y validados.
3. **Validar rutas con expertas**: asegurar que las rutas sean realistas y efectivas para el contexto latinoamericano.
4. **Añadir seguimiento de progreso**: permitir que las beneficiarias marquen módulos completados y den feedback.
5. **Integrar plataformas de aprendizaje**: conectar con Coursera, edX, Udemy para recursos específicos.
6. **Añadir autenticación y consentimiento** conforme a Habeas Data/GDPR.
7. **Automatizar despliegues** (Railway/Render para backend y Vercel/Netlify para frontend).
8. **Validar enlaces educativos**: Sistema para verificar que los recursos recomendados sigan activos.

---

¡La transformación está completa! Ahora tienes un asistente de rutas de aprendizaje STEM personalizado que automatiza el proceso manual de orientación educativa de Geek Girls LatAm. El sistema genera planes de estudio completos con journey de 4 fases, evaluando el perfil de cada beneficiaria y recomendando el camino más adecuado para su desarrollo profesional en STEM. 💜🚀

