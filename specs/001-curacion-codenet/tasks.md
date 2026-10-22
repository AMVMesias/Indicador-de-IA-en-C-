# Tasks: Curación reproducible de código histórico C++

**Input**: spec.md, plan.md, research.md, data-model.md y contracts/pipeline.md.

**Tests**: Requeridos por FR-012. Las pruebas preceden a las funciones correspondientes.

## Phase 1: Setup

- [x] T001 Crear config/iteration1.json con cuota positiva, cinco ejercicios, semilla y fecha UTC conforme a data-model.md.
- [x] T002 [P] Fijar dependencias del notebook en requirements-notebook.txt y exclusiones en .gitignore.

## Phase 2: Foundational

- [x] T003 Escribir casos de entradas inválidas y extracción segura en tests/test_pipeline.py para FR-001 y FR-009.
- [x] T004 Implementar validación de configuración, rutas y extracción en src/codenet_pipeline.py; límite de 1048576 bytes por archivo y 268435456 bytes por extracción; split pertenece a train, validation o test.

## Phase 3: User Story 1 - Seleccionar muestras trazables

**Goal**: Obtener diez muestras por ejercicio con procedencia completa.

**Independent Test**: Entrada controlada, cuota exacta y fallo de insuficiencia sin salida final.

- [x] T005 [US1] Escribir pruebas de filtros, usuarios, cuota y duplicados en tests/test_pipeline.py para FR-002 a FR-005.
- [x] T006 [US1] Implementar lectura de metadatos y selección en src/codenet_pipeline.py; submission_id único, code_bytes mayor que cero y no superior a 1048576, label=HISTORICO_CODENET.
- [x] T007 [US1] Preparar data/source_subset/Project_CodeNet con metadatos originales, muestras seleccionadas y atribución para FR-004 y FR-011.

## Phase 4: User Story 2 - Reservar ejercicios

**Goal**: Conservar cada ejercicio en una sola partición y detectar corrupción.

**Independent Test**: Comprobar reparto, ausencia de ejercicios compartidos y detección de contenido alterado.

- [x] T008 [US2] Escribir pruebas de partición e integridad en tests/test_pipeline.py para FR-006 y FR-010.
- [x] T009 [US2] Implementar verificación de manifiesto, huellas y solapamiento de usuarios en src/codenet_pipeline.py.

## Phase 5: User Story 3 - Reproducir y auditar

**Goal**: Regenerar el subconjunto y consultar sus controles desde Jupyter.

**Independent Test**: Dos manifiestos idénticos y ejecución completa del notebook.

- [x] T010 [US3] Escribir prueba de determinismo y exportación en tests/test_pipeline.py para FR-007 y FR-008.
- [x] T011 [US3] Completar exportaciones CSV/JSON en src/codenet_pipeline.py conservando bytes originales.
- [x] T012 [US3] Crear notebooks/01_curacion_codenet.ipynb con configuración, selección, controles, reproducción y límites de alcance para FR-011 y FR-012.
- [x] T013 [US3] Ejecutar tests/test_pipeline.py y el notebook completo; guardar evidence/pytest.xml, evidence/notebook_execution.json y evidence/acceptance.json.

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 [P] Documentar instalación, reproducción y diferencia entre modo completo y reducido en README.md.
- [x] T015 Relacionar FR-001 a FR-012 con sus tareas y evidencias en specs/001-curacion-codenet/coverage.md.
- [x] T016 Contrastar especificación, plan y código; registrar el cierre de convergencia en evidence/convergence.json.

## Dependencies & Execution Order

T001 y T002 preceden a la base. T003 precede a T004. T005 precede a T006 y T007. T008 precede a T009. T010 precede a T011; T012 integra las tres historias. T013 respalda la auditoría de aceptación. T014 puede avanzar en paralelo con la implementación después de fijar el contrato. T015 y T016 completan trazabilidad y convergencia.

## Parallel Example

La configuración y las dependencias afectan archivos distintos. Una vez definida la interfaz, la guía README.md y los casos de rutas pueden prepararse sin modificar src/codenet_pipeline.py. Las tareas que comparten tests/test_pipeline.py o el módulo del pipeline mantienen orden secuencial.

## Implementation Strategy

La historia US1 entrega el mínimo funcional: una selección trazable. US2 añade separación e integridad. US3 incorpora reproducción y evidencia de aceptación. Las casillas solo cambian a completadas después de comprobar cada resultado; el cierre de esta iteración no equivale al cierre de la tesis.
