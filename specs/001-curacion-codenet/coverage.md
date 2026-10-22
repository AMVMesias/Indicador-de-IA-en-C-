# Auditoría de cobertura de la primera iteración

## Dictamen de cumplimiento

Los doce requisitos funcionales de la iteración 001 cuentan con implementación y evidencia verificable. Las dieciséis pruebas automatizadas y los diez controles del subconjunto cumplen; el notebook termina sin errores y reproduce el manifiesto de la selección original. El cierre corresponde a la curación de datos, no al desarrollo completo de la tesis.

Speckit-coverage identifica el entregable académico de auditoría. Spec Kit 1.2.2 utiliza la habilidad converge para contrastar código, especificación, plan y tareas; no incorpora una habilidad central denominada coverage. La matriz siguiente conserva la denominación solicitada sin atribuir ejecución a un comando inexistente.

## Matriz de trazabilidad

| Requisito | Criterio revisado | Tareas | Evidencia |
|---|---|---|---|
| FR-001 | Fuente válida y lectura estática | T003, T004 | Prueba de fuente ausente y funciones de lectura |
| FR-002 | C++, Accepted y fecha anterior al corte | T005, T006 | Prueba de filtros y control eligibility |
| FR-003 | Cuota y usuarios distintos por ejercicio | T005, T006 | Pruebas de cuota y usuario; controles quota y unique_users_per_problem |
| FR-004 | Procedencia completa por muestra | T006, T007 | Manifiesto y control required_fields |
| FR-005 | Bytes originales y deduplicación normalizada | T005, T006 | Prueba de bytes y duplicados; huellas únicas |
| FR-006 | Partición exclusiva por ejercicio | T008, T009 | Reparto 30/10/10 y control no_shared_problems |
| FR-007 | Selección independiente del orden de entrada | T010, T011 | Prueba de CSV reordenado y segunda selección |
| FR-008 | Exportación completa de datos y resultados | T011, T012 | Prueba de exportación, CSV y JSON generados |
| FR-009 | Rutas, enlaces y límites de extracción | T003, T004 | Pruebas de recorrido de ruta, enlace y tamaño |
| FR-010 | Verificación de integridad y solapamiento | T008, T009 | Pruebas de corrupción y partición; diagnóstico de usuarios |
| FR-011 | Etiqueta histórica y alcance explícito | T007, T012 | Control historical_label y ausencia de entrenamiento declarada |
| FR-012 | Pruebas y ejecución integral | T012, T013 | 16 pruebas y siete celdas de código ejecutadas |

Los doce requisitos cumplen. La cobertura de requisitos es 12 de 12, equivalente al 100 % del alcance especificado. Este porcentaje no mide cobertura de líneas o ramas, exactitud de un clasificador ni calidad de toda la tesis.

## Criterios de éxito

| Criterio | Resultado observado | Estado |
|---|---|---|
| SC-001 Volumen | 50 muestras, 10 por ejercicio | Cumple |
| SC-002 Elegibilidad y campos | Todos los registros cumplen | Cumple |
| SC-003 Duplicados y separación | Cero huellas repetidas y cero ejercicios compartidos | Cumple |
| SC-004 Distribución | 30/10/10; 10 usuarios distintos en cada ejercicio | Cumple |
| SC-005 Reproducción y alteración | Manifiestos idénticos; corrupción detectada en prueba | Cumple |
| SC-006 Pruebas y trazabilidad | 16 pruebas sin fallos; 12 requisitos vinculados | Cumple |

## Controles de los datos

| Control | Evidencia observada |
|---|---|
| Cuotas | Diez muestras en cada uno de los cinco ejercicios |
| Campos obligatorios | Identificadores, fecha, lenguaje, estado, rutas y huellas completos |
| Elegibilidad | C++, Accepted y fecha previa al corte |
| Identificadores únicos | Cincuenta entregas distintas |
| Huellas normalizadas | Cincuenta valores distintos |
| Usuarios por ejercicio | Diez usuarios distintos en cada grupo |
| Asignación de partición | Coincide con la configuración |
| Ejercicios compartidos | Ninguno entre las tres particiones |
| Integridad | Bytes y huellas coinciden con el manifiesto |
| Etiqueta | HISTORICO_CODENET con fundamento explícito |

El diagnóstico adicional registra cero usuarios compartidos entre entrenamiento y validación, entrenamiento y prueba, y validación y prueba en la selección observada. Ese resultado no demuestra independencia por autor de cualquier selección futura.

## Verificación de escenarios

Las pruebas positivas comprueban la selección válida, las exportaciones, la conservación de bytes y la lectura de un comprimido seguro. Los escenarios negativos cubren fuente ausente, configuración inválida, cuota insuficiente, campos faltantes, fechas inválidas, archivo ausente o vacío, filtros de lenguaje y estado, duplicación, alteración de contenido, asignación de partición incorrecta, rutas que escapan, enlaces y tamaño excesivo.

La reproducción compara una segunda selección en un destino independiente. Una prueba adicional reordena los CSV y exige igualdad byte a byte del manifiesto. La ejecución completa del notebook valida la integración entre configuración, funciones y evidencia.

## Revisión de principios

| Principio | Evidencia | Estado |
|---|---|---|
| I Especificaciones verificables | Requisitos, aceptación, tareas y matriz | Cumple |
| II Procedencia y reproducción | Metadatos originales y manifiesto reproducido | Cumple |
| III Separación por ejercicio | Particiones exclusivas y hashes únicos | Cumple |
| IV Interpretación responsable | Etiqueta operacional y alcance delimitado | Cumple |
| V Evidencia y seguridad | Pruebas negativas, lectura estática e integridad | Cumple |

La revisión de convergencia no identifica obligaciones funcionales pendientes dentro de esta iteración. Los documentos y sus casillas no sustituyen las evidencias de ejecución.

## Entorno de ejecución

Las pruebas requieren pytest en el mismo intérprete que usa el kernel. La selección puede funcionar aunque esa dependencia falte. La verificación adicional con Python 3.13.14 y pytest 9.1.1 completa las dieciséis pruebas sin fallos; evidence/pytest_python313.xml conserva ese resultado.

## Limitaciones y trabajo posterior

La igualdad de huellas normalizadas detecta duplicados exactos salvo finales de línea; no detecta renombrado, cambios de comentarios o equivalencia semántica. Los cinco enunciados revisados representan tareas distintas, pero la ampliación a veinte ejercicios exige revisar los grupos de problemas equivalentes y casi duplicados de CodeNet.

El origen histórico no certifica autoría humana. La selección de entregas Accepted excluye errores que pueden aparecer en código estudiantil. El corpus competitivo difiere del contexto de una clase. Estas limitaciones afectan la futura evaluación del indicador y requieren contraste en el dominio docente.

La generación de muestras IA, el entrenamiento, la calibración, el motor de similitud, la interfaz web y la validación con docentes quedan fuera de los requisitos de esta iteración. Ninguna cifra del incremento permite afirmar desempeño del detector ni reducción del tiempo de revisión docente.

## Evidencias de consulta

- evidence/full_source_selection.json: selección original y huellas de metadatos.
- data/curated/manifest.csv: cincuenta registros trazables.
- data/curated/verification.json: diez controles e integridad.
- evidence/pytest.xml: resultados de pruebas automatizadas.
- evidence/acceptance.json: reproducción y aceptación integral.
- evidence/notebook_execution.json: celdas ejecutadas y duración.
