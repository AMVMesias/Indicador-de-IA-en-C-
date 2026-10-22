# Implementación de la primera iteración

## Resultado funcional

La iteración 001 entrega un pipeline de curación y un notebook ejecutado con cincuenta muestras C++ históricas de CodeNet. La selección conserva los programas originales, reconstruye su procedencia y separa los ejercicios en entrenamiento, validación y prueba. Los controles automáticos comprueban integridad, cuotas, elegibilidad y reproducción.

El incremento cubre la preparación de datos del futuro indicador de posible generación mediante IA. El entrenamiento, la calibración, el análisis de similitud y la aplicación web pertenecen a las siguientes iteraciones. La evidencia disponible no contiene métricas de clasificación ni atribuciones automáticas de autoría.

## Recorrido funcional

1. Cargar la configuración y localizar la fuente histórica.
2. Leer los metadatos de los cinco ejercicios y aplicar los filtros acordados.
3. Ordenar los candidatos con la semilla y completar las cuotas sin repetir usuario por ejercicio ni contenido normalizado.
4. Conservar los bytes originales y exportar el manifiesto y los controles.
5. Repetir la selección en un destino independiente y comparar el manifiesto.
6. Ejecutar las pruebas y guardar la evidencia de aceptación.

## Composición observada

| Ejercicio | Contenido | Partición | Muestras |
|---|---|---|---|
| p02401 | Calculadora simple | Entrenamiento | 10 |
| p02402 | Mínimo, máximo y suma | Entrenamiento | 10 |
| p02403 | Impresión de un rectángulo | Entrenamiento | 10 |
| p02407 | Inversión de números | Validación | 10 |
| p02416 | Suma de dígitos | Prueba | 10 |

Los enunciados cubren operadores, selección, acumulación, ciclos, arreglos y cadenas. Su correspondencia con temas introductorios sustenta esta primera selección; el tamaño actual no permite generalizar resultados de un detector a toda una asignatura.

## Selección sobre la fuente completa

| Medida | Valor observado |
|---|---|
| Registros de metadatos de los cinco problemas | 75,699 |
| Descartados por lenguaje o extensión | 49,413 |
| Descartados por estado | 13,104 |
| Candidatos elegibles por metadatos | 13,182 |
| Archivos leídos hasta completar las cuotas | 50 |
| Muestras seleccionadas | 50 |
| Duración de esa selección | 2.1667 segundos |

La duración corresponde a una ejecución con los archivos ya extraídos; no incluye la lectura previa del comprimido y no constituye un benchmark. Los filtros de metadatos recorren los registros de los cinco ejercicios. El control de archivos recorre los candidatos en orden hasta completar la cuota; sus conteos no representan una auditoría exhaustiva de todos los programas del corpus.

## Reproducción y entorno

El modo ligero utiliza cincuenta filas originales y los cincuenta programas incluidos. Su manifiesto coincide con el obtenido de los metadatos completos. El modo de fuente completa permite repetir la selección desde una extracción local o desde el comprimido original. La cuota y la lista de ejercicios son configurables.

La ejecución utilizó Python 3.12.14 y un equipo con AMD Ryzen 5 5500U, seis núcleos, doce hilos y aproximadamente 19,3 GiB de RAM. No necesitó GPU. El notebook contiene 16 celdas; sus 7 celdas de código terminaron sin errores. La duración de la ejecución integral fue de 16.476 segundos e incluye arranque del kernel y pruebas. Esa cifra describe una ejecución, sin establecer una garantía de tiempo.

## Componentes entregados

| Componente | Responsabilidad |
|---|---|
| Biblioteca de curación | Carga, filtros, selección, seguridad y controles |
| Configuración del incremento | Semilla, cuota, corte temporal y particiones |
| Notebook ejecutado | Uso guiado y resultados verificables |
| Fuente reducida | Reproducción rápida con procedencia original |
| Manifiesto y huellas | Relación entre muestra, ejercicio y partición |
| Pruebas y evidencia | Aceptación funcional y trazabilidad de resultados |

## Aceptación de la implementación

Las 16 pruebas automatizadas pasaron, sin fallos, errores ni omisiones. Los diez controles del manifiesto cumplen. La reproducción independiente conserva los mismos identificadores, particiones y huellas. La prueba de alteración detecta contenido modificado sobre una copia, sin afectar los originales.

Los datos históricos conservan su atribución a IBM Project CodeNet y el texto de CDLA Permissive 2.0. La etiqueta HISTORICO_CODENET describe procedencia; el corte temporal y el estado Accepted no certifican autoría humana individual.
