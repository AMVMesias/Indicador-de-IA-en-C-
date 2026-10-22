# Decisiones de investigación

## Fuente y etiqueta

**Decision**: IBM CodeNet, C++ Accepted anterior a 2021-05-01; HISTORICO_CODENET.

**Rationale**: Los metadatos documentan problema, envío y fecha. Accepted indica aceptación por el juez; no acredita autoría humana. El corte histórico no demuestra ausencia de asistencia automatizada.

**Alternatives considered**: Código público sin fecha, mezcla de lenguajes y aceptación indiscriminada dificultan controlar procedencia y dominio.

Fuente: https://github.com/IBM/Project_CodeNet#metadata

## Duplicados y partición

**Decision**: Semilla explícita, un usuario por ejercicio, huellas normalizadas y partición por ejercicio. Registrar autores compartidos entre particiones.

**Rationale**: Los duplicados y problemas equivalentes pueden inflar métricas. La igualdad exacta no agota equivalencia estructural o semántica.

**Alternatives considered**: Partición aleatoria por archivo y eliminación total de comentarios. La primera facilita fuga; la segunda elimina señales de estilo.

Fuente: https://github.com/IBM/Project_CodeNet#differentiation

## Notebook y biblioteca

**Decision**: Biblioteca estándar para el pipeline y notebook con funciones importadas.

**Rationale**: La curación no necesita GPU ni un framework de aprendizaje. Las funciones pueden reutilizarse en experimentos y backend.

**Alternatives considered**: Toda la lógica en celdas o iniciar la interfaz web; ninguna mejora la selección inicial.

## Condiciones de los datos

**Decision**: Incluir CDLA Permissive 2.0 y atribución junto con las muestras.

**Rationale**: El apéndice A.6 del artículo distingue CDLA para datos y Apache 2.0 para herramientas.

**Alternatives considered**: Aplicar a las muestras la licencia del software no conserva esa distinción.

Fuentes: https://jiechenjiechen.github.io/pub/codenet.pdf y https://cdla.dev/permissive-2-0/

## Correspondencia del taller

**Decision**: Speckit-coverage designa el informe académico de cobertura, respaldado por pruebas y revisión de convergencia.

**Rationale**: Spec Kit 1.2.2 incorpora converge; no instala una habilidad central coverage. La auditoría no atribuye ejecución a un comando inexistente.

Fuente: https://github.com/github/spec-kit/tree/v1.2.2
