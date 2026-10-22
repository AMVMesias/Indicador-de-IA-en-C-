# Feature Specification: Curación reproducible de código histórico C++

**Feature Branch**: `001-curacion-codenet` (identificador de incremento; no requiere rama Git).

**Created**: 2026-10-21

**Status**: Especificación base de la iteración 001.

**Input**: Preparar una base trazable de código histórico para el futuro clasificador de posible generación mediante IA de la tesis.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seleccionar muestras trazables (Priority: P1)

Como integrante del equipo investigador, necesito seleccionar entregas históricas de cinco ejercicios introductorios para disponer de una referencia de procedencia documentada.

**Why this priority**: La validez de los experimentos posteriores depende de conocer qué representa cada muestra.

**Independent Test**: Una selección válida entrega diez muestras por ejercicio y permite rastrear cada una a su registro original.

**Acceptance Scenarios**:

1. **Given** entregas con metadatos, **When** aplico los criterios de selección, **Then** obtengo cincuenta muestras C++ aceptadas, anteriores al 1 de mayo de 2021, sin repetir usuario dentro del ejercicio.
2. **Given** un ejercicio con menos de diez candidatos válidos, **When** solicito la selección, **Then** recibo un error que identifica la insuficiencia y no aparece un subconjunto final incompleto.

### User Story 2 - Reservar ejercicios para evaluación (Priority: P1)

Como investigador, necesito asignar cada ejercicio a una sola partición para evitar que una variante del mismo ejercicio aparezca en aprendizaje y evaluación.

**Why this priority**: Una separación inadecuada puede inflar las métricas futuras.

**Independent Test**: Un manifiesto con ejercicios conocidos permite verificar la exclusividad de las particiones sin entrenar modelos.

**Acceptance Scenarios**:

1. **Given** cinco ejercicios seleccionados, **When** asigno las particiones previstas, **Then** tres pertenecen a entrenamiento, uno a validación y uno a prueba.
2. **Given** una muestra repetida o un ejercicio asignado a dos particiones, **When** verifico el manifiesto, **Then** el control informa el incumplimiento.

### User Story 3 - Reproducir y auditar el subconjunto (Priority: P2)

Como integrante del equipo, necesito regenerar la selección y consultar sus controles para comprobar que los datos corresponden al alcance acordado.

**Why this priority**: La repetición permite contrastar los resultados y continuar el experimento con entradas estables.

**Independent Test**: Dos selecciones con la misma entrada y configuración contienen los mismos identificadores, particiones y huellas, incluso si cambia el orden de lectura.

**Acceptance Scenarios**:

1. **Given** la misma entrada y configuración, **When** repito la selección, **Then** obtengo el mismo manifiesto y las mismas huellas.
2. **Given** un archivo alterado, **When** verifico su integridad, **Then** el control falla y señala la entrega afectada.

### Edge Cases

Una fuente inexistente produce un diagnóstico claro. Los registros sin campos obligatorios, con fechas inválidas, rutas inseguras, archivos ausentes, contenido vacío o codificación ilegible quedan rechazados con motivo. Los enlaces no constituyen entradas válidas. Una cuota insuficiente impide publicar resultados finales. Un código no aceptado no puede incorporarse por conveniencia. Un duplicado normalizado cuenta como una sola muestra aunque tenga otro identificador. El mismo usuario en ejercicios distintos genera un diagnóstico de solapamiento entre particiones, sin afirmar independencia por autor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La herramienta DEBE validar la existencia de la fuente y comunicar errores de acceso sin ejecutar el código recibido.
- **FR-002**: La selección DEBE incluir solo entregas C++, con estado Accepted y fecha válida anterior a 2021-05-01T00:00:00Z.
- **FR-003**: El resultado DEBE contener diez muestras de cada uno de los cinco ejercicios acordados y un usuario distinto por ejercicio; la insuficiencia debe impedir el cierre.
- **FR-004**: Cada muestra DEBE conservar problema, entrega, usuario anonimizado, fecha original y legible, lenguaje, estado, ruta de origen, tamaño y criterio de etiqueta.
- **FR-005**: La herramienta DEBE conservar los bytes originales y excluir duplicados globales después de normalizar únicamente los finales de línea; no debe atribuir equivalencia semántica a esta operación.
- **FR-006**: Cada ejercicio DEBE pertenecer a una única partición; el reparto debe contener tres ejercicios de entrenamiento, uno de validación y uno de prueba.
- **FR-007**: La misma entrada, semilla y configuración DEBEN producir el mismo manifiesto aunque cambie el orden de los registros.
- **FR-008**: La herramienta DEBE exportar el manifiesto, las cincuenta muestras, un resumen de selección y un informe de controles verificables.
- **FR-009**: La herramienta DEBE rechazar rutas fuera de la fuente, enlaces y archivos no regulares, y aplicar límites durante la lectura del comprimido.
- **FR-010**: La herramienta DEBE permitir comprobar las huellas de las muestras, el cumplimiento de las cuotas, la exclusividad de particiones y el solapamiento de usuarios entre ellas.
- **FR-011**: La ejecución DEBE distinguir el origen histórico de una autoría certificada y declarar que todavía no existen entrenamiento, muestras IA ni métricas del clasificador.
- **FR-012**: La entrega DEBE incluir pruebas automatizadas de selección, rechazo de entradas, integridad y reproducibilidad, junto con una ejecución completa de la interfaz de análisis.

### Key Entities

- **Ejercicio**: enunciado identificable, tema introductorio y partición asignada.
- **Entrega histórica**: programa de procedencia CodeNet con sus metadatos originales.
- **Muestra curada**: entrega elegible conservada con huellas de integridad y etiqueta operacional HISTORICO_CODENET.
- **Configuración**: cuota, semilla, fecha límite, ejercicios y reglas de partición.
- **Resultado de verificación**: control, valor observado, condición esperada y estado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cincuenta muestras disponibles, distribuidas en cinco ejercicios con diez muestras cada uno.
- **SC-002**: El 100 % de las muestras conserva los campos obligatorios y satisface lenguaje, estado y fecha límite.
- **SC-003**: Cero huellas normalizadas repetidas y cero ejercicios compartidos entre particiones.
- **SC-004**: Treinta muestras de entrenamiento, diez de validación y diez de prueba; diez usuarios distintos dentro de cada ejercicio.
- **SC-005**: Dos selecciones bajo la misma configuración coinciden exactamente; una alteración controlada del contenido activa un fallo de integridad.
- **SC-006**: Todas las pruebas de aceptación implementadas pasan y la ejecución completa termina sin errores. La auditoría vincula los doce requisitos con tareas y evidencia.

## Assumptions

La primera iteración usa cinco ejercicios introductorios con enunciados distintos: calculadora, mínimo/máximo/suma, impresión de rectángulo, inversión de números y suma de dígitos. La fecha límite reduce exposición a generadores recientes, pero no prueba autoría humana. El alcance completo de la tesis mantiene veinte ejercicios y cuatrocientas soluciones. La futura comparación humano/IA requiere incorporar generaciones bajo los mismos enunciados y ampliar el corpus.

El usuario de esta iteración es el equipo investigador. Los docentes utilizarán una interfaz web en incrementos posteriores. El desempeño del clasificador, la deduplicación semántica, la agrupación automática de problemas equivalentes y la independencia estricta por autor quedan fuera del cierre actual. La verificación de cinco enunciados distintos reduce un riesgo concreto, sin certificar que todo CodeNet carezca de equivalencias.
