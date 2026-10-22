# Implementation Plan: Curación reproducible de código histórico C++

**Branch**: `001-curacion-codenet` | **Date**: 2026-10-21 | **Spec**: [Especificación](spec.md)

## Summary

El incremento prepara cincuenta muestras históricas de CodeNet con una biblioteca pequeña y un notebook como interfaz de investigación. La selección aplica filtros, cuotas, control de duplicados y partición por ejercicio. La salida conserva los programas originales, un manifiesto y evidencia de aceptación. El clasificador y la aplicación docente dependen de esta base, pero no forman parte de la implementación actual.

## Technical Context

**Language/Version**: Python 3.12; funciones de curación compatibles con Python 3.11 o posterior.

**Primary Dependencies**: Biblioteca estándar para datos; Jupyter, nbformat, nbclient e ipykernel para el notebook; pytest para aceptación. No requiere GPU ni servicios externos.

**Storage**: Archivos C++, CSV y JSON locales. La fuente reducida permite repetir la selección; el modo completo acepta el archivo original o una extracción local controlada.

**Testing**: Casos unitarios y de integración con entradas sintéticas pequeñas; verificación del manifiesto real y ejecución completa en un kernel nuevo.

**Target Platform**: Windows con PowerShell y Jupyter; rutas portables con pathlib.

**Project Type**: Biblioteca de preparación de datos con interfaz notebook.

**Performance Goals**: Registrar la duración observada sin imponer un umbral arbitrario. Una pasada secuencial del comprimido evita mantener el corpus completo en memoria.

**Constraints**: Sin ejecutar C++; máximo 1 MiB por archivo y 256 MiB de extracción seleccionada; miembros regulares, rutas previstas y rechazo de enlaces. El comprimido original ocupa aproximadamente 8,34 GB y no se duplica en la entrega.

**Scale/Scope**: Cinco ejercicios; cuota diez; semilla 20261021; corte 2021-05-01T00:00:00Z; reparto 30/10/10.

## Constitution Check

| Principio | Decisión | Evidencia de cierre |
|---|---|---|
| I Especificaciones | Doce requisitos y seis resultados medibles | Matriz completa de cobertura |
| II Reproducibilidad | Orden estable por semilla e identificador | Manifiestos idénticos |
| III Sin fuga por ejercicio | Asignación explícita e indivisible | Cero ejercicios compartidos |
| IV Interpretación | Etiqueta HISTORICO_CODENET | Sin autoría certificada atribuida |
| V Evidencia y seguridad | Lectura estática y rutas controladas | Pruebas negativas e integridad |

La revisión previa y el diseño no requieren excepciones. La auditoría comprobará el cumplimiento observado.

## Project Structure

### Documentation (this feature)

specs/001-curacion-codenet contiene spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md y tasks.md. La constitución reside en .specify/memory/constitution.md.

### Source Code (repository root)

- src/codenet_pipeline.py: validación, carga, selección, exportación e integridad.
- config/iteration1.json: reglas de selección y particiones.
- notebooks/01_curacion_codenet.ipynb: ejecución explicada y resultados.
- tests/test_pipeline.py: pruebas de aceptación y entradas inválidas.
- data/source_subset/: fuente reducida trazable.
- data/curated/: muestras finales y manifiesto.
- evidence/: controles, pruebas y ejecución.

**Structure Decision**: El notebook coordina funciones reutilizables. La lógica permanece fuera de las celdas para facilitar pruebas y una futura integración con FastAPI.

## Diseño de selección y partición

El cargador exige los campos originales. La elegibilidad requiere C++, Accepted, fecha anterior al corte y archivo regular legible. El orden usa SHA-256 de semilla e identificador; el orden del CSV no altera el resultado. La selección descarta usuarios repetidos dentro del ejercicio y huellas normalizadas repetidas globalmente. La normalización solo convierte CRLF y CR a LF; la exportación conserva los bytes originales.

La asignación reserva p02401, p02402 y p02403 para entrenamiento; p02407 para validación; p02416 para prueba. El control compara ejercicios, huellas y usuarios entre particiones. El solapamiento de usuarios es un diagnóstico; la independencia por autor no es un criterio de cierre actual.

## Etapas y dependencias

1. Base y contratos: configuración, estructura y aceptación.
2. Selección: lectura, elegibilidad, deduplicación y cuota.
3. Partición: asignación e integridad.
4. Reproducción: exportaciones, notebook y segunda selección.
5. Cierre: ejecución completa, auditoría y comprobación de aceptación.

El orden mínimo es base, selección, partición y reproducción. Las pruebas de rutas y la guía pueden avanzar en paralelo después de fijar los contratos. El cierre exige resultados verificables, sin asumir una duración de desarrollo.

## Riesgos y respuesta

| Riesgo | Efecto | Respuesta |
|---|---|---|
| Etiqueta histórica imperfecta | Sesgo futuro | Conservar fundamento y limitación |
| Código competitivo | Diferencia con estudiantes | Elegir enunciados introductorios |
| Duplicados con cambios | Repeticiones no detectadas | Ampliar controles antes de entrenar |
| Comprimido grande | Extracción lenta | Fuente reducida reproducible |
| Cuota insuficiente | Resultado incompleto | Fallar sin relajar reglas |
| Dependencias de entorno | Ejecución difícil | Versiones e instrucciones |

## Continuidad de la tesis

La iteración 002 amplía a veinte ejercicios e incorpora generaciones IA y variantes. La iteración 003 compara modelos, entrena y calibra el indicador. Las siguientes integran similitud, API e interfaz docente. El corpus final y sus particiones requieren definición antes de entrenar; 3/1/1 solo corresponde a esta demostración.
