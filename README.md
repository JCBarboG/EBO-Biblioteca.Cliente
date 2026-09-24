# EBO — Extracción Bibliográfica y Organizacional

**Versión:** 3.0.0 | **Estado:** Producción (GitHub Pages)  
**Desarrollador:** Jean Barboza González  
**URL:** [EBO-Biblioteca.Cliente](https://jcbarbog.github.io/EBO-Biblioteca.Cliente/)

---

## 📋 Descripción General

EBO es una **Progressive Web App (PWA)** de catalogación bibliográfica diseñada para facilitar la extracción y organización de información bibliográfica desde portadas de libros, revistas y tesis. La plataforma utiliza OCR (reconocimiento óptico de caracteres) local en el navegador para extraer texto de imágenes y organizar los datos según estándares MARC 21.

### Propósito Principal
Automatizar y agilizar el proceso de catalogación bibliográfica en entornos bibliotecológicos, permitiendo a profesionales de la información trabajar sin necesidad de instalaciones adicionales o servidores.

---

## 🎯 Características Principales

### ✅ Funcionalidades Actuales (v3.0.0 - Free)

1. **Captura de imágenes multi-fotografía**
   - Hasta 3 imágenes por registro
   - Carga desde cámara o archivo
   - Navegación entre imágenes con flechas
   - Rotación de imágenes 90°
   - Validación de orientación (retrato requerido)

2. **Extracción de texto con OCR**
   - OCR local en el navegador (Tesseract.js v5.1.1)
   - Sin necesidad de servidor
   - Procesamiento en Web Worker
   - Indicador de progreso en tiempo real
   - Soporte para múltiples idiomas

3. **Catalogación con estándares MARC 21**
   - 3 tipos de documentos: Libros, Revistas, Tesis
   - Campos bibliográficos específicos por tipo
   - Interfaz de selección y asignación de texto
   - Sufijos MARC 21 automáticos
   - Validación de datos

4. **Exportación a Excel**
   - Tabla interactiva con vista previa
   - Exportación multi-registro con formato profesional
   - Columnas con etiquetas A, B, C...
   - Numeración de filas tipo base datos
   - Soporte para múltiples tipos de documento

5. **Interfaz Multiidioma**
   - Español (es) e Inglés (en)
   - Cambio dinámico de idioma
   - Traducciones completas de UI

6. **Sistema de Soporte**
   - Formulario de contacto con EmailJS
   - Adjuntar hasta 4 imágenes
   - Envío de reportes de errores
   - Contacto directo: jeanbarbozag05@gmail.com

7. **PWA Offline-First**
   - Instalable en dispositivos
   - Funciona sin conexión (excepto OCR)
   - Sincronización automática de servicios
   - Manifests de App Web (iOS/Android)

8. **Modo oscuro**
   - Personalización de apariencia
   - Selector visual en configuración

---

## 🏗️ Stack Tecnológico

```
Frontend:
├── React 18.3.1
├── Vite 5.4.11 (bundler)
└── CSS Modular

OCR y Procesamiento:
├── Tesseract.js 5.1.1 (OCR local)
├── Web Workers (procesamiento async)
└── Canvas API

Exportación:
├── XLSX 0.18.5 (Excel export)
└── Conversión de datos dinámicos

PWA:
├── vite-plugin-pwa 1.3.0
├── Workbox (caché estratégico)
└── Service Workers

Email:
├── @emailjs/browser 4.4.1
└── EmailJS Template (template_od1rur4)

Desarrollo:
├── Node.js
├── npm
└── GitHub Pages (deploy)
```

---

## 📱 Flujo de Usuario (3 Pasos)

### **Paso 01: Captura de Imágenes**
```
Usuario sube/fotografía portada → EBO valida orientación 
→ Muestra preview → Usuario rotaciona si es necesario
→ Usuario hace clic "Extraer información"
→ OCR procesa imagen(es) en Web Worker
→ Texto extraído se muestra en Paso 02
```

**Puntos clave:**
- Máximo 3 imágenes
- Orientación retrato obligatoria
- Múltiples formatos de imagen soportados (JPG, PNG, WEBP)

### **Paso 02: Texto y Asignación**
```
OCR text visible → Usuario selecciona fragmento de texto
→ Usuario hace clic en categoría bibliográfica
→ Texto asignado a campo → Visual feedback (chip activo 400ms)
→ Puede seguir editando campos manualmente
→ O procesar siguiente imagen del registro
```

**Puntos clave:**
- Vista dual: texto extraído a la izquierda, campos a la derecha
- Selección de texto integrada
- Edición manual de campos
- Campos vacíos se ignoran

### **Paso 03: Guardar y Exportar**
```
Usuario verifica campos → Hace clic "Guardar datos"
→ Registro se agrega a tabla en Excel format
→ Tabla muestra datos con columnas MARC
→ Usuario puede continuar con nuevo registro
→ O exporta todos los registros a archivo .xlsx
```

**Puntos clave:**
- Tabla interactiva con vista previa
- Exportación de múltiples registros
- Limpieza de tabla con confirmación
- Descarga automática de archivo Excel

---

## 📚 Tipos de Documentos y Campos

### **1. LIBRO (📚)**
15 campos:
- `titulo`, `subtitulo`, `autor`, `autorSecundario`
- `editorial`, `pais`, `anio`, `edicion`
- `descFisica`, `idioma`, `isbn`, `issn`
- `traductor`, `revisor`, `fecha`

### **2. REVISTA (📰)**
11 campos:
- `tituloRevista`, `volNum`, `anio`, `fechaPub`
- `issn`, `editorial`, `pais`, `idioma`
- `articulo`, `autorArt`, `fecha`

### **3. TESIS (🎓)**
11 campos:
- `titulo`, `autor`, `universidad`, `programa`
- `director`, `anio`, `pais`, `idioma`
- `nivel`, `palabrasClave`, `fecha`

**Nota:** Cada tipo tiene columnas específicas en Excel y traducciones para ES/EN.

---

## 📂 Estructura del Proyecto

```
J:\Escritorio\Aplicación de OCR/
├── index.html                    # HTML principal
├── package.json                  # Dependencias v3.0.0
├── vite.config.js               # Vite + PWA config
├── .gitignore
├── .claude/                      # Claude Code config
│   └── settings.local.json
├── public/                       # Assets estáticos
│   ├── icons/                    # PWA icons (48, 96, 192, 512px)
│   └── tessdata/                 # Tesseract language data
├── src/
│   ├── App.jsx                   # Componente principal (3 pasos)
│   ├── main.jsx                  # Punto de entrada React
│   ├── App.css                   # Estilos principales
│   ├── components/
│   │   ├── BooksTable.jsx        # Tabla Excel (paso 03)
│   │   ├── CategoryFields.jsx    # Panel de campos (paso 02)
│   │   ├── ConfigPanel.jsx       # Modal de configuración
│   │   ├── DocTypeSelector.jsx   # Selector de tipo documento
│   │   ├── Drawer.jsx            # Menú lateral
│   │   ├── Footer.jsx            # Footer con links
│   │   ├── ImageInput.jsx        # Captura de imágenes (paso 01)
│   │   ├── OcrProgress.jsx       # Barra de progreso OCR
│   │   ├── TextEditor.jsx        # Editor de texto (paso 02)
│   │   └── Toast.jsx             # Notificaciones
│   ├── context/
│   │   └── AppContext.jsx        # Estado global (lang, docType)
│   ├── hooks/
│   │   ├── useOcrWorker.js       # Web Worker para Tesseract
│   │   ├── useOrientationDetector.js
│   │   ├── useToast.js           # Toast notifications
│   │   └── tesseractPaths.js     # Rutas de assets Tesseract
│   ├── views/
│   │   ├── AboutView.jsx         # Acerca de EBO
│   │   ├── PremiumView.jsx       # Versión Premium (roadmap)
│   │   ├── PrivacyView.jsx       # Política privacidad
│   │   ├── SupportView.jsx       # Formulario de soporte (EmailJS)
│   │   └── TermsView.jsx         # Términos de uso
│   ├── utils/
│   │   ├── exportExcel.js        # XLSX export logic
│   │   ├── marcSymbols.js        # Sufijos MARC 21
│   │   └── rotateImage.js        # Canvas image rotation
│   ├── constants/
│   │   ├── categories.js         # (legacy)
│   │   └── docTypes.js           # Definiciones de tipos, campos
│   └── i18n/
│       └── translations.js       # Traducciones ES/EN
├── scripts/
│   └── copy-tesseract-assets.mjs # Script postinstall
├── dist/                         # Build producción (GitHub Pages)
└── .vite/                        # Caché Vite
```

---

## 🔧 Arquitectura y Decisiones Técnicas

### **1. Web Worker para OCR**
- Tesseract.js se ejecuta en un worker separado
- No bloquea la UI durante procesamiento
- Indicador visual de progreso
- Manejo de errores con fallback

**Archivo:** `src/hooks/useOcrWorker.js`

### **2. Context API para Estado Global**
- `AppContext` gestiona:
  - Idioma actual (es/en)
  - Tipo de documento seleccionado (libro/revista/tesis)
  - Disponible en toda la app

**Archivo:** `src/context/AppContext.jsx`

### **3. Manejo de Imágenes**
- Blob URLs para preview
- Cleanup automático al desmontar
- Rotación con Canvas API
- Validación de orientación

**Archivos:** `src/components/ImageInput.jsx`, `src/utils/rotateImage.js`

### **4. PWA y Caché**
- Service Worker automático con vite-plugin-pwa
- Precache: HTML, JS, CSS, SVG, PNG, ICO (excepto Tesseract)
- Estrategia Workbox: cache-first para assets, network-first para datos

**Config:** `vite.config.js` (líneas 13-42)

### **5. Email con EmailJS**
- Credenciales hardcodeadas (seguras en browser público)
- Template ID: `template_od1rur4`
- Service ID: `service_dhokhvc`
- Soporte para adjuntos en base64

**Archivo:** `src/views/SupportView.jsx`

### **6. Excel Export con XLSX**
- Generación dinámica de workbook
- Columnas con letras (A, B, C...)
- Numeración de filas (2, 3, 4... = fila 1 es header)
- Estilos básicos aplicados

**Archivo:** `src/utils/exportExcel.js`

---

## 🚀 Desarrollo y Deploy

### **Prerequisitos**
- Node.js 18+ y npm
- Acceso a internet (para Tesseract data download)

### **Instalación Local**
```bash
# Clonar repo
git clone https://github.com/JCBarboG/EBO-Biblioteca.Cliente.git
cd EBO-Biblioteca.Cliente

# Instalar dependencias
npm install

# Copiar assets Tesseract (ejecutado automáticamente)
# npm run postinstall
```

### **Desarrollo**
```bash
# Iniciar servidor de desarrollo (Vite)
npm run dev

# Servidor disponible en: http://localhost:5173
# Hot Module Replacement (HMR) habilitado
```

### **Build Producción**
```bash
# Compilar para producción
npm run build

# Output en: ./dist/
# Tamaño aproximado: ~3-5 MB (sin assets Tesseract precacheados)
```

### **Deploy a GitHub Pages**
```bash
# Requiere: gh-pages instalado (incluido en devDeps)
# También requiere: git configurado y permisos en repo

npm run deploy

# Despliega automáticamente a:
# https://jcbarbog.github.io/EBO-Biblioteca.Cliente/
```

**Nota:** El `base` en `vite.config.js` es `/EBO/` (nombre exacto del repo).

---

## 📊 Flujo de Datos (Diagrama Mental)

```
[Captura de imagen]
         ↓
[Preview + Validación orientación]
         ↓
[Usuario hace clic "Extraer"]
         ↓
[OCR en Web Worker (Tesseract)]
         ↓
[Texto extraído mostrado]
         ↓
[Usuario selecciona fragmentos y asigna a campos]
         ↓
[Registro con datos completo]
         ↓
[Guardar en tabla (React state)]
         ↓
[Mostrar en tabla Excel]
         ↓
[Exportar a .xlsx con XLSX library]
```

---

## 🎨 Interfaz Visual

### **Pantalla Principal (3 Secciones)**
1. **Paso 01: Imágenes**
   - Área de drop/upload
   - Preview con navegación
   - Botón de rotación
   - Barra de progreso OCR

2. **Paso 02: Texto y Asignación**
   - Editor de texto a la izquierda (editable)
   - Campos de categorías a la derecha
   - Chips de asignación con feedback visual

3. **Paso 03: Tabla y Exportación**
   - Tabla con columnas dinámicas
   - Botones: Guardar, Exportar, Limpiar

### **Menú Lateral (Drawer)**
- 📋 Nuevo registro
- ⬇️ Exportar Excel
- ⚙️ Configuración
- 💬 Soporte / Contacto
- ℹ️ Acerca de EBO
- ⭐ Conocer Premium (roadmap)

### **Panel de Configuración**
- Idioma (ES / EN)
- Modo oscuro on/off
- Información de versión
- Permisos (cámara, almacenamiento)

---

## 🔜 Roadmap — EBO Premium (En desarrollo)

El plan futuro incluye:

### **IA Avanzada (Claude AI)**
- Análisis automático de portadas
- Extracción inteligente de campos
- Corrección automática de OCR

### **Almacenamiento en Nube**
- Sincronización de registros
- Historial sincronizado
- Acceso multi-dispositivo

### **Reportes y Estadísticas**
- Análisis de colección bibliográfica
- Gráficos interactivos
- Exportación de reportes

### **Búsqueda Avanzada**
- Full-text search
- Filtros múltiples
- Deduplicación

### **Características Premium**
- Imágenes ilimitadas (ahora max 3)
- Soporte prioritario
- Exportación multi-formato
- Acceso desde múltiples dispositivos

---

## 📌 Notas Importantes para Desarrollo

### **Configuración EmailJS**
Credenciales almacenadas en `src/views/SupportView.jsx`:
```javascript
const EMAILJS_SERVICE_ID = 'service_dhokhvc';
const EMAILJS_TEMPLATE_ID = 'template_od1rur4';
const EMAILJS_PUBLIC_KEY = 'ejIEJTkMEVI-8zDnr';
```
⚠️ Cambiar si se migra a otra cuenta de EmailJS.

### **Tesseract Language Data**
- Descargado automáticamente del CDN (v5.1.1)
- Soporta múltiples idiomas
- No requiere precache (se descarga on-demand)
- Ruta configurada en `src/hooks/tesseractPaths.js`

### **PWA Manifest**
- Configurado en `vite.config.js`
- Nombre: "EBO — Extracción Bibliográfica y Organizacional"
- Color primario: `#0d2842` (azul oscuro)
- Instalable en iOS/Android

### **Límites Actuales**
- Máximo 3 imágenes por registro
- Máximo 4 archivos en formulario soporte
- Máximo 4 imágenes en soporte
- Sin límite de registros en tabla (limitado por RAM)

### **Localización**
Idiomas soportados:
- **Español (es)** — idioma por defecto
- **Inglés (en)** — traducción completa

Agregar idiomas requiere editar `src/i18n/translations.js`.

---

## 🐛 Troubleshooting

### **OCR tarda mucho**
- Tesseract.js descarga ~100 MB de data en primer uso
- Verificar conexión a internet
- Usar navegador moderno (Chrome, Firefox, Edge, Safari)

### **Imagen no carga**
- Formato soportado: JPG, PNG, WEBP
- Tamaño máximo recomendado: < 5 MB
- Verificar permisos de cámara

### **Export a Excel falla**
- Verificar navegador soporta Blob API
- Revisar console por errores
- Intentar con pocos registros primero

### **PWA no se instala**
- Requerir HTTPS (GitHub Pages es HTTPS)
- Verificar manifest en devtools
- Limpiar caché del navegador

---

## 📞 Contacto y Soporte

- **Desarrollador:** Jean Barboza González
- **Email:** jeanbarbozag05@gmail.com
- **Formulario:** Usar "Soporte / Contacto" en la app
- **Repositorio:** [EBO-Biblioteca.Cliente](https://github.com/JCBarboG/EBO-Biblioteca.Cliente)

---

## 📄 Licencia y Términos

- **Versión:** 3.0.0 (Free)
- **Estado:** Producción activa
- **Términos:** Ver "Términos de uso" en la app
- **Privacidad:** Ver "Política de privacidad" en la app

---

## 🎯 Resumen Ejecutivo para Nuevos Desarrolladores

**En 5 minutos:**
1. EBO es una PWA que extrae datos bibliográficos de imágenes
2. Stack: React 18 + Vite + Tesseract.js + XLSX
3. Flujo: Foto → OCR → Asignar campos → Excel
4. 3 tipos de documentos con campos MARC 21
5. PWA offline-first instalable en cualquier dispositivo

**Estructura mental:**
- `App.jsx` = Componente principal (3 pasos)
- `AppContext` = Estado global (idioma, tipo doc)
- `useOcrWorker` = OCR en background
- `BooksTable + exportExcel` = Excel export
- `components/*` = Interfaz modular

**Para continuar:**
- Agregar características Premium (IA, nube, reportes)
- Mejorar UX/UI según feedback de usuarios
- Optimizar tamaño de Tesseract
- Considerar backend para Premium

---

*Último update: Julio 2026 | Versión 3.0.0*
