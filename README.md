<div align="center">
  
<!-- Placeholder para el logotipo del centro -->
<h1>METRODORA MADRID RÍO</h1>
<h2>Grado Superior en DAM</h2>
<h3>Trabajo Fin de Grado</h3>

<br/>

# MYLEX

<br/>

**Nombre y apellidos del alumno:** Fabián Luna Vicente  
**Tutores:** [Nombre de los Tutores]  
**Fecha de la entrega:** [Fecha de Entrega, ej. Junio 2026]  

</div>

<br/>
<br/>

# ÍNDICE

1. **INTRODUCCIÓN Y JUSTIFICACIÓN**
2. **ANÁLISIS Y REQUISITOS**
   - 2.1. Requisitos Funcionales
   - 2.2. Requisitos No Funcionales
   - 2.3. Casos de Uso e Historias de Usuario
3. **PLANIFICACIÓN**
4. **DISEÑO**
5. **DESARROLLO E IMPLEMENTACIÓN**
6. **PRUEBAS (TESTING)**
7. **CONCLUSIONES Y FUTURAS MEJORAS**
8. **BIBLIOGRAFÍA Y ANEXOS**

---

# 1. INTRODUCCIÓN Y JUSTIFICACIÓN

**MyLex** es una plataforma integral e interactiva para el aprendizaje de idiomas que aprovecha la Inteligencia Artificial (IA) para ofrecer una experiencia inmersiva. 

**El problema que resuelve:** El aprendizaje tradicional de idiomas, especialmente la asimilación de vocabulario y la fluidez conversacional, suele ser monótono y carece de contextos reales. Muchos estudiantes sienten frustración al no tener a alguien nativo con quien practicar constantemente de manera natural.

**Justificación:** MyLex soluciona este problema proporcionando a los usuarios "Salas de Chat Inteligentes" donde pueden interactuar con diferentes "Personas IA" (con distintos roles, personalidades y contextos), forzando al usuario a utilizar el vocabulario que está aprendiendo. Además, la aplicación incluye una **Extensión de Google Chrome** que permite capturar palabras y su contexto mientras el usuario navega por internet, rompiendo la barrera entre estudiar y navegar.

**A qué usuario va dirigida:** Estudiantes de idiomas (autodidactas o en academias), profesionales que buscan mejorar su vocabulario técnico y personas interesadas en practicar conversaciones bilingües en cualquier momento.

---

# 2. ANÁLISIS Y REQUISITOS

## 2.1. Requisitos Funcionales
1. **Gestión de Usuarios:** El usuario debe poder registrarse, verificar su correo electrónico e iniciar sesión (incluyendo integración OAuth con Google).
2. **Gestión de Vocabulario:** El usuario debe poder crear listas de vocabulario personalizadas y añadir palabras junto a su definición, traducción y contextos.
3. **Diccionario Contextual con IA:** El sistema debe analizar automáticamente el significado de una palabra dependiendo de un bloque de texto donde haya sido encontrada.
4. **Salas de Chat Multi-Agente:** El usuario podrá crear salas de chat, seleccionar el idioma y añadir participantes simulados por IA con roles específicos.
5. **Corrección en Tiempo Real:** El sistema debe corregir gramaticalmente las intervenciones del usuario y verificar si ha utilizado el vocabulario objetivo.
6. **Extensión de Navegador:** Debe existir un complemento para Chrome que permita guardar palabras y sus orígenes (URL y párrafo) de manera rápida en las listas del usuario.
7. **Gamificación y Progreso:** Registro diario del progreso del usuario, rachas de estudio (streaks), estadísticas y recuento de uso de palabras.
8. **Interacción Social:** El usuario debe poder buscar amigos, enviar/recibir solicitudes de amistad y ver perfiles públicos.

## 2.2. Requisitos No Funcionales
1. **Rendimiento y Escalabilidad:** El backend debe responder con baja latencia. Por ello, se hace uso de Redis para cachear el historial de chat y WebSocket para la comunicación fluida en tiempo real.
2. **Seguridad:** Uso estricto de JWT (JSON Web Tokens) con políticas de expiración cortas (Access Tokens) y rotación (Refresh Tokens), además del encriptado de contraseñas mediante Bcrypt. Protección contra ataques fuerza bruta mediante Rate Limiting (SlowAPI).
3. **Multiplataforma y Responsividad:** La interfaz web debe adaptarse fluidamente a dispositivos de escritorio, tabletas y móviles gracias al diseño UI responsivo.
4. **Alta Disponibilidad de IA:** Uso del motor LLM de alto rendimiento (Groq - Llama 3) para garantizar tiempos de respuesta rápidos en la inferencia conversacional.

## 2.3. Casos de Uso e Historias de Usuario
- *Historia 1:* "Como usuario quiero guardar una palabra en mi lista directamente desde una noticia que estoy leyendo en el navegador sin abrir una nueva pestaña, para no interrumpir mi lectura".
- *Historia 2:* "Como estudiante de inglés quiero entrar a una sala de chat con una IA que simule ser un camarero de Londres, y que la aplicación me obligue a usar el vocabulario 'Coffee, Receipt, Tip' para avanzar en el juego".
- *Historia 3:* "Como usuario registrado quiero poder enviar invitaciones a otros usuarios y revisar mi propia racha de estudio semanal".

---

# 3. PLANIFICACIÓN

El desarrollo se ha estructurado mediante el uso de **metodologías ágiles**, enfocándose fuertemente en **Scrum** y **Kanban**.
- **Sprints:** Iteraciones semanales o bisemanales para entregar funcionalidades incrementales (Ej. Sprint 1: Autenticación, Sprint 2: Diccionario IA, Sprint 3: Websockets y LangGraph, Sprint 4: Extensión).
- **Control de Tareas:** Se han empleado tableros Kanban para mover tareas desde el estado de *Backlog* (Lista de Deseos) a *In Progress* y *Done*.
- **Diagrama de Gantt:** (Debe adjuntarse visualmente en la entrega final del proyecto si se requiere la gráfica; los tiempos van desde la configuración del proyecto, pasando por backend, frontend y fase final de pruebas).

---

# 4. DISEÑO

- **Arquitectura de Software:** Se implementó una **Arquitectura Limpia / Multicapas** en el Backend:
  1. *Routers (Controllers):* Definen los Endpoints.
  2. *Services:* Alojan la lógica de negocio pura y la conexión con LLMs.
  3. *Repositories:* Encapsulan todas las transacciones SQL de SQLAlchemy.
- **Base de Datos (Modelo Entidad-Relación):** 
  PostgreSQL almacena entidades con fuertes relaciones relacionales: 
  `Users` (1:1) `Profiles` | `Users` (1:N) `VocabularyLists` | `Lists` (N:M) `Words` | `Users` (1:N) `ChatRooms` | `ChatRooms` (1:N) `ChatMessages` y `ChatParticipants`.
- **Diagramas de LangGraph:** El sistema conversacional utiliza un modelo de grafos dirigido: El Nodo Orquestador decide quién habla, el Generador construye la respuesta con IA, el Revisor evalúa la corrección, y el Enviador transmite la respuesta definitiva por WebSocket.
- **UI / UX:** Se diseñaron vistas minimalistas usando esquemas oscuros modernos y componentes asíncronos rápidos (Framer Motion + TailwindCSS).

*(Nota: Los diagramas UML, ER y Wireframes específicos deben presentarse en anexos gráficos dentro de la memoria entregada).*

---

# 5. DESARROLLO E IMPLEMENTACIÓN

El ecosistema tecnológico desarrollado se compone de tres piezas, orquestadas vía **Docker Compose**:

1. **Backend (API) y Servicios**
   - **Lenguaje:** Python 3.11.
   - **Framework:** FastAPI (Asíncrono y de alto rendimiento).
   - **Base de Datos Principal:** PostgreSQL 15.
   - **Caché y Mensajería:** Redis (para memoria a corto plazo del chat).
   - **Inteligencia Artificial:** LangGraph (Agentes) y Groq API (LLM Llama-3).
   - **Herramientas Clave:** SQLAlchemy (ORM), Alembic (Migraciones), Uvicorn (ASGI).

2. **Frontend (Plataforma Web)**
   - **Framework:** React 18 / 19 bajo el empaquetador Vite.
   - **Estilos:** Tailwind CSS y animaciones con Framer Motion.
   - **Gestión de Peticiones:** Axios.
   - **Gráficos y Datos:** Recharts.

3. **Extensión del Navegador (Chrome Extension)**
   - **Tecnologías:** React y Vite configurado con `@crxjs/vite-plugin`.
   - **Implementación:** Consta de un `Service Worker` en background que reacciona a los clics del usuario y un script de contenido (Content Script) inyectado que muestra un Floating UI sin afectar el DOM original del sitio.

4. **Control de Versiones y Entorno:**
   - **Git** como sistema de versionado, almacenando el progreso de los sprints.
   - **Docker** para contenerizar de forma independiente Frontend, API, Redis y DB, garantizando el despliegue automático.

---

# 6. PRUEBAS (TESTING)

Durante el ciclo de desarrollo se llevaron a cabo pruebas enfocadas en garantizar la fiabilidad del sistema:
- **Validación Manual Exhaustiva:** Comprobación de todas las rutas mediante Swagger UI (`http://localhost:8000/docs`).
- **Casos de Prueba (Auth):** Verificación de generación, expiración y rotación exitosa de JWT tokens, comprobación de fallos ante credenciales inválidas.
- **Validación del Chat IA:** Pruebas rigurosas sobre el nodo revisor (*Review Node* en LangGraph) simulando interacciones erróneas del LLM para forzar auto-correcciones y verificar que el vocabulario objetivo se haya cumplido efectivamente.
- **Testing Multiplataforma de la Extensión:** Se probó la inyección en distintas páginas estáticas y dinámicas (SPAs) verificando que las políticas de seguridad (CORS) y los z-index CSS de la extensión no entraran en conflicto.

---

# 7. CONCLUSIONES Y FUTURAS MEJORAS

**Conclusiones y Aprendizajes:**  
El desarrollo de MyLex ha demostrado la capacidad para integrar múltiples módulos técnicos: creación de bases de datos relacionales eficientes, seguridad en el acceso a datos, diseño de APIs robustas e inyección de nuevas tecnologías como Inteligencia Artificial Generativa. Orquestar agentes con LangGraph representó el mayor desafío y a su vez el mayor éxito, logrando un comportamiento humano asombrosamente fluido.

**Futuras Mejoras:**
1. **Soporte de Audio Bidireccional:** Integrar Whisper (Speech-to-Text) para que el usuario hable por el micrófono y los agentes respondan con voz (Text-to-Speech).
2. **Aplicación Móvil:** Portar el cliente React a un entorno nativo (Flutter o React Native) para acceder en cualquier lugar y recibir notificaciones de estudio (Push Notifications).
3. **Monetización:** Añadir un nivel de suscripción Premium a través de la pasarela Stripe para costear el uso de LLMs de pago.

---

# 8. BIBLIOGRAFÍA Y ANEXOS

**Manual de Instalación y Despliegue:**
1. Clonar el repositorio.
2. Definir en `/backend` y `/frontend` los archivos `.env` siguiendo las plantillas `.env.example`.
3. Levantar la infraestructura mediante Docker: `docker-compose up -d --build`.
4. Ejecutar las migraciones de base de datos dentro del contenedor: `docker exec -it mylex_api alembic upgrade head`.
5. Cargar la extensión yendo a `chrome://extensions`, modo desarrollador, "Cargar descomprimida" y seleccionando la carpeta `extension/dist`.

**Recursos Empleados:**
- Documentación oficial de **FastAPI**: https://fastapi.tiangolo.com/
- Documentación de **LangGraph**: https://python.langchain.com/v0.1/docs/langgraph/
- Documentación de **React y Vite**: https://react.dev/ y https://vitejs.dev/

*(Se anexa el código fuente completo en el repositorio digital correspondiente y las demostraciones funcionales necesarias para la defensa del proyecto).*
