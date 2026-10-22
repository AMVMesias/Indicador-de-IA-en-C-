<!-- Sync Impact Report: plantilla inicial -> 1.0.0. Cinco principios definidos; secciones de alcance y calidad incorporadas; sin pendientes de plantilla. Fecha de emisión inicial, sin aprobación institucional atribuida. -->
# Constitución del prototipo de apoyo a la integridad académica

## Core Principles

### I. Especificaciones verificables

Cada incremento DEBE contar con requisitos identificados, criterios de aceptación y tareas vinculadas antes de su implementación. El cierre exige evidencias de ejecución y una auditoría de cobertura. Una tarea pendiente no puede figurar como cumplida por tener una descripción o un archivo vacío.

### II. Procedencia y reproducibilidad

Cada muestra DEBE conservar el identificador del problema, el identificador de entrega, el usuario anonimizado, la fecha de envío, el lenguaje, el estado y la ruta de origen. La configuración DEBE registrar la semilla y las reglas de selección. La misma entrada y configuración DEBEN generar el mismo manifiesto. Las huellas SHA-256 permiten verificar la integridad de los archivos seleccionados.

### III. Evaluación sin fuga de información

Los ejercicios y sus variantes DEBEN permanecer en una única partición. Los duplicados exactos normalizados DEBEN excluirse del subconjunto. Las etapas posteriores DEBEN agrupar también los problemas equivalentes y las familias derivadas. El conjunto de prueba no puede orientar la selección del modelo o de sus parámetros.

### IV. Interpretación responsable

El indicador de posible generación mediante IA DEBE mantenerse separado de la similitud entre entregas. Ningún resultado automático puede presentarse como prueba de copia, autoría o motivo de sanción. El código histórico de CodeNet constituye una referencia operacional de procedencia humana, no una certificación individual de autoría. Las métricas futuras DEBEN explicitar esa limitación.

### V. Evidencia y seguridad

El código de terceros DEBE tratarse como dato y no ejecutarse durante la curación. El acceso a comprimidos DEBE rechazar rutas inseguras y enlaces. Las verificaciones DEBEN cubrir tanto entradas válidas como errores y resultados reproducibles. Los informes DEBEN distinguir resultados observados, decisiones de diseño y trabajo pendiente, sin inventar mediciones.

## Alcance y restricciones

El producto completo comprende análisis textual, estructural y semántico de entregas C++, un clasificador de posible IA y una aplicación web para docentes. La iteración 001 prepara datos históricos: cinco ejercicios y diez muestras válidas por ejercicio. El entrenamiento, la generación de muestras IA, la fusión de similitud, la interfaz docente y el despliegue pertenecen a incrementos posteriores. El subconjunto inicial no reemplaza el corpus de veinte ejercicios y cuatrocientas soluciones previsto para la tesis.

La redistribución pública de las muestras exige revisar las condiciones aplicables a los datos y a sus plataformas de origen. El paquete académico conserva atribución y procedencia; no atribuye a la licencia del software de Spec Kit derechos sobre el código de CodeNet.

## Flujo y criterios de calidad

Scrum organiza el trabajo por incrementos. SDD define el comportamiento, el diseño, las tareas, la implementación y su verificación dentro de cada incremento. Las pruebas de integridad, selección, partición y reproducción constituyen condiciones de cierre de esta iteración. La auditoría debe contrastar el alcance de las especificaciones con el comportamiento implementado y sus evidencias.

## Governance

Mesias Mariscal y Denise Rea integran el equipo del proyecto. Los cambios en los principios requieren una justificación registrada, revisión del impacto sobre requisitos y pruebas, y actualización de versión. Un cambio incompatible incrementa la versión mayor; una regla nueva, la menor; una aclaración, el parche. La auditoría verifica los cinco principios y registra las excepciones con su efecto. La versión 1.0.0 corresponde a la propuesta inicial del taller y no presupone una aprobación institucional.

**Version**: 1.0.0 | **Ratified**: 2026-10-21 | **Last Amended**: 2026-10-21
