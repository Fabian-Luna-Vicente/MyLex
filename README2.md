# 🌟 MyLex: Revolución en el Aprendizaje de Idiomas

Bienvenido a la documentación profunda de **MyLex**, orientada a explicar la propuesta de valor para el usuario final y desglosar minuciosamente cómo se orquesta la magia a nivel de código.

---

## 🎯 ¿Por qué deberías usar MyLex? (Beneficios para el Usuario)

El aprendizaje de un nuevo idioma suele enfrentarse a tres barreras críticas: **falta de práctica conversacional, memorización sin contexto y monotonía**. MyLex está construido para destruir estas barreras.

1. **Inmersión Sin Salir de Casa:** No necesitas viajar o pagar a un tutor 24/7. MyLex crea *Salas de Chat Inteligentes* pobladas por Agentes de IA que asumen roles (ej. Un recepcionista de hotel en París, o un amigo en un pub de Londres). Tienes que hablar con ellos en tiempo real.
2. **Aprendizaje Activo, no Pasivo:** La IA no solo "habla contigo". Analiza si estás empleando las palabras que *necesitas aprender* de tu lista de vocabulario, forzándote a aplicar la teoría en la práctica. Si te equivocas, un agente corrector te explica por qué.
3. **Aprendizaje Invisible (La Extensión Chrome):** Si estás leyendo un artículo del New York Times y no entiendes una palabra, no necesitas abrir un traductor. La extensión de MyLex te permite guardar la palabra junto con el párrafo exacto donde la encontraste. Al volver a la app, tu vocabulario estará ahí, con su contexto original y listo para ser practicado.
4. **Gamificación Social:** MyLex convierte el estudio en un hábito mediante "Rachas" (Streaks) diarias, estadísticas de uso, y la posibilidad de conectar con amigos para comparar niveles y progresos.

---

## 🚀 Todas las Funcionalidades (Features)

- **🤖 Diccionario Contextual potenciado por LLM (Llama 3):** No te da definiciones genéricas. Si seleccionas la palabra "Bank", la IA lee el texto completo para saber si se refiere a una "entidad financiera" o a la "orilla de un río", y te devuelve la definición correcta para *ese* contexto.
- **🛠️ Corrector Gramatical Inteligente:** Corrige tus oraciones explicando el motivo del error, como lo haría un profesor, en lugar de solo reemplazar la palabra.
- **🎭 Sistema Multi-Agente (LangGraph):** Múltiples IAs pueden estar en la misma sala de chat. El "Orquestador" decide qué agente debe responderte dependiendo de la conversación, creando interacciones increíblemente dinámicas.
- **🧠 Memoria Híbrida de Chat (Redis + PostgreSQL):** Las IAs recuerdan qué hablaste hace 10 mensajes (gracias a la caché en memoria ultrarrápida) y, si el chat es muy largo, una tarea en segundo plano hace "resúmenes" para no saturar el modelo y no olvidar la premisa inicial.
- **✉️ Autenticación de Múltiples Vías:** Registro por correo verificado (OTP vía email real) o acceso en un solo clic con tu cuenta de Google (OAuth2).

---

## 🛡️ Seguridad: Tu Información Protegida

Como usuario, tu privacidad e integridad están blindadas gracias a estrategias técnicas avanzadas:
- **Tus contraseñas son indescifrables:** Nunca se guardan tal cual. Se usa un algoritmo de encriptación pesado llamado **Bcrypt**. Ni siquiera el administrador de la base de datos puede saber cuál es tu contraseña.
- **Control de Sesiones Robustas (JWT Dual):** Cuando inicias sesión, recibes un "Access Token" (que expira en solo 15 minutos para evitar robos si dejas la sesión abierta) y un "Refresh Token" más largo. Si este último es robado y cambias tu contraseña, el sistema invalida todos los tokens antiguos automáticamente (Listas negras / Revocación UUID).
- **Inmunidad ante Ataques Automatizados:** Si un hacker intenta adivinar tu contraseña masivamente, el sistema **SlowAPI (Rate Limiting)** detecta las peticiones excesivas desde su IP y lo bloquea temporalmente.

---

## ⚙️ Arquitectura Técnica Detallada: ¿Qué hace cada archivo?

A continuación, se detalla el ciclo de vida de la aplicación y la responsabilidad única de cada bloque de código:

### 1. El Backend (FastAPI + Python)

* **`main.py`**: El corazón del backend. Recibe todas las peticiones desde el navegador, aplica el escudo de seguridad de "CORS" (solo deja pasar a MyLex, no a otras páginas) y reparte el trabajo a las diferentes "rutas".
* **Carpeta `core/`** *(Los Cimientos)*:
  * `config.py`: Carga las claves secretas (como tu API de Groq o claves de base de datos) desde el `.env`.
  * `database.py`: Crea el puente seguro entre Python y la base de datos PostgreSQL usando SQLAlchemy.
  * `security.py`: Ejecuta la matemática compleja (Bcrypt y JWT) para firmar tus credenciales.
  * `ws_connection.py`: Mantiene un túnel abierto (WebSocket) para que los mensajes del chat fluyan de ida y vuelta en milisegundos sin recargar la página.
  * `redis_chat.py`: Envía los mensajes recientes a "Redis" (una memoria RAM temporal) para que la IA los recupere instantáneamente.
* **Carpeta `api/routes/`** *(Los Controladores)*:
  Reciben la petición HTTP (Ej. `POST /auth/login`). Validan que los datos tengan sentido y luego delegan el trabajo pesado al "Servicio".
* **Carpeta `services/`** *(El Cerebro)*:
  * `ai_service.py`: El intermediario que "habla" con el proveedor de IA (Groq). Traduce tus peticiones a *Prompts* (instrucciones) y procesa los JSON que la IA devuelve.
  * `chat_service.py`: Prepara el terreno del chat. Llama a LangGraph, actualiza tu racha de uso de palabras e inyecta la memoria al chat.
  * `auth_service.py` y `email_service.py`: Manejan el alta, verifican el token de Google y envían el correo de confirmación conectándose a SMTP.
* **Carpeta `repositories/`** *(Los Bibliotecarios)*:
  Estos archivos (`user_repository.py`, `chat_repository.py`) son los únicos autorizados para ejecutar sentencias SQL. Leen y guardan cosas de manera estructurada en PostgreSQL para mantener el código de negocio limpio.
* **Carpeta `models/` y `schemas/`**:
  * Los **Models** dictan cómo se ven las tablas en la Base de Datos (Columnas, Tipos de datos, Claves foráneas).
  * Los **Schemas** (Pydantic) dictan cómo debe lucir la información que entra y sale de la API (JSON structs) para que no entren datos basura.
* **Carpeta `graph/` (La Magia de LangGraph)**:
  Aquí vive la toma de decisiones de la IA:
  * `builder.py`: Arma el flujo de trabajo circular.
  * `nodes.py`: Contiene los 4 pasos: (1) **Orquestador**: Decide qué IA debe hablar. (2) **Generador**: Escribe la respuesta forzando tus palabras de estudio. (3) **Revisor**: Revisa si la IA cumplió las reglas; si no, la manda a re-hacer su trabajo. (4) **Enviador**: Dispara el mensaje final al usuario vía WebSocket.

### 2. El Frontend (React + Vite)

* **`src/pages/`**: Cada archivo aquí es una "Pantalla" (Dashboard, Perfil, Login, Chat). Organizan los componentes visuales.
* **`src/services/api/`**: Contiene configuraciones de Axios. Si una petición da un error "401 (No autorizado)", automáticamente intenta usar el `Refresh Token` para conseguir un nuevo acceso sin que el usuario note nada.
* **`src/hooks/`**: Pequeños extractores lógicos de React. Evitan que las pantallas tengan demasiada lógica compleja y solo se dediquen a pintar la interfaz.

### 3. La Extensión del Navegador (Chrome Extension)

* **`manifest.json`**: El contrato con Google Chrome. Le dice al navegador: "Déjame añadir opciones cuando el usuario haga clic derecho y déjame mostrar un menú flotante sobre la web".
* **`background.js`**: Siempre despierto. Cuando haces clic derecho en una palabra y eliges "Traducir con MyLex", este archivo escucha esa acción y le dice a la pantalla que despliegue el menú.
* **`content.jsx`**: Es un script que inyecta la interfaz de MyLex *por encima* de la página actual, creando una "burbuja" interactiva sin destruir la web original donde estás estudiando.

---

## 🏆 Conclusión

Deberías usar MyLex porque **es el puente entre aprender reglas en un cuaderno y utilizar el lenguaje orgánicamente en la vida real**. Al unir un diseño moderno y fluido, gamificación, una herramienta permanente en tu navegador, e IAs con comportamientos hiper-personalizados bajo una arquitectura moderna y escalable, **MyLex deja de ser un simple diccionario para convertirse en tu inmersión bilingüe personal.**
