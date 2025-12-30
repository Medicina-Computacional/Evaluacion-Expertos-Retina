# Plataforma de Evaluación Oftalmológica

Una plataforma web diseñada para recolectar evaluaciones de expertos sobre segmentaciones de imágenes de retina. Esta herramienta permite a los profesionales médicos revisar, calificar y comentar sobre segmentaciones automatizadas para validar su precisión.

## Características

-   **Interfaz de Evaluación para Expertos**: Interfaz limpia y sin distracciones para revisar imágenes de retina y sus máscaras.
-   **Sistema de Calificación**:
    -   **Aceptabilidad**: Escala de 4 puntos (Excelente, Buena, Regular, Mala).
    -   **Confianza**: Escala de 5 puntos.
    -   **Comentarios**: Retroalimentación textual opcional.
    -   **Cronometraje**: Rastrea automáticamente la duración de la evaluación.
-   **Gestión del Flujo de Trabajo**:
    -   Presentación aleatoria de casos.
    -   Evita la re-evaluación del mismo caso por el mismo experto.
    -   Seguimiento del progreso para los evaluadores.
-   **Acceso Basado en Roles**:
    -   **Evaluadores**: Acceso al flujo de trabajo de evaluación.
    -   **Administradores**: Tablero para gestionar usuarios y ver estadísticas.
-   **Autenticación Segura**: Sistema de inicio de sesión basado en JWT.

## Stack Tecnológico

### Backend
-   **Python 3.10+**
-   **FastAPI**: Framework web de alto rendimiento.
-   **SQLAlchemy**: ORM para interacciones con la base de datos.
-   **SQLite**: Base de datos predeterminada (fácil de cambiar por PostgreSQL).
-   **Pydantic**: Validación de datos.

### Frontend
-   **React 19**: Librería de UI.
-   **Vite**: Herramienta de compilación y servidor de desarrollo.
-   **TypeScript**: Desarrollo con tipado seguro.
-   **Tailwind CSS**: Estilizado utility-first.
-   **React Router v7**: Enrutamiento del lado del cliente.
-   **Axios**: Cliente HTTP.

## Guía de Inicio

### Prerrequisitos
-   Python 3.10 o superior
-   Node.js 18 o superior
-   Git

### Instalación

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/Medicina-Computacional/Evaluacion-Expertos-Retina.git
    cd Evaluacion-Expertos-Retina
    ```

2.  **Configuración del Backend**
    ```bash
    cd backend
    python -m venv venv
    
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    
    pip install -r requirements.txt
    
    # Iniciar servidor
    uvicorn main:app --reload
    ```
    La API del backend correrá en `http://localhost:8000` (documentación en `/docs`).

3.  **Configuración del Frontend**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    El frontend correrá en `http://localhost:5173`.

## Configuración

### Variables de Entorno
Crea un archivo `.env` en el directorio `backend` (valores por defecto opcionales incluidos en el código):
-   `CORS_ORIGINS`: Lista de orígenes permitidos separados por comas (por defecto: `http://localhost:5173,http://localhost:3000`).
-   `S3_BASE_URL`: URL base para servir imágenes (por defecto: `http://localhost:8000/static`).
-   `SECRET_KEY`: Clave secreta para codificación JWT (configurar en `auth.py`).

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
