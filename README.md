# ConectaU

Plataforma de conexión entre estudiantes y empresas para oportunidades laborales.

## Descripción

ConectaU es una plataforma web que facilita la conexión entre estudiantes universitarios y empresas, permitiendo a las empresas publicar vacantes y a los estudiantes postularse a las mismas. La plataforma está construida con HTML, CSS y JavaScript, utilizando Firebase como backend.

## Características

- Autenticación de usuarios (estudiantes y empresas)
- Publicación de vacantes por parte de las empresas
- Búsqueda y filtrado de vacantes
- Sistema de postulaciones
- Perfiles diferenciados para estudiantes y empresas
- Diseño responsive
- Notificaciones en tiempo real

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Firebase (Authentication, Firestore)
- Google Fonts
- Material Icons

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/conectau.git
```

2. Abre el proyecto en tu editor favorito

3. Abre index.html en tu navegador o usa un servidor local

## Configuración de Firebase

El proyecto utiliza Firebase para la autenticación y base de datos. Necesitarás:

1. Crear un proyecto en Firebase Console
2. Habilitar Authentication y Firestore
3. Copiar la configuración de Firebase y actualizarla en los archivos correspondientes

## Estructura del proyecto

```
conectau/
├── index.html           # Página de inicio
├── login.html          # Página de inicio de sesión
├── register.html       # Página de registro
├── dashboard.html      # Panel de estudiantes
├── empresa.html        # Panel de empresas
├── style.css          # Estilos generales
├── dashboard.css      # Estilos del dashboard
├── new_style.css     # Nuevos estilos modernos
├── app.js            # Lógica principal
├── dashboard.js      # Lógica del dashboard
└── empresa.js        # Lógica del panel de empresas
```

## Uso

1. Los estudiantes pueden:
   - Registrarse con su correo institucional
   - Ver vacantes disponibles
   - Filtrar vacantes por diferentes criterios
   - Postularse a vacantes
   - Ver el estado de sus postulaciones

2. Las empresas pueden:
   - Registrarse como empresa
   - Publicar vacantes
   - Ver postulaciones recibidas
   - Gestionar sus vacantes publicadas

## Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Contacto

Tu Nombre - [@tuTwitter](https://twitter.com/tuTwitter)
Link del proyecto: [https://github.com/tu-usuario/conectau](https://github.com/tu-usuario/conectau)