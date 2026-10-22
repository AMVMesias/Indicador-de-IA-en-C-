# Guía de ejecución

## Entorno

Python 3.12 y Jupyter. Instalar requirements-notebook.txt en un entorno propio. La lógica del pipeline solo requiere biblioteca estándar.

## Reproducción rápida

Abrir notebooks/01_curacion_codenet.ipynb y ejecutar todas las celdas. El modo predeterminado usa data/source_subset/Project_CodeNet y regenera data/curated. El resultado esperado es cincuenta muestras y reparto 30/10/10. La fuente reducida reproduce la selección distribuida; no vuelve a demostrar la búsqueda en todo el corpus.

## Fuente completa

Configurar CODENET_ROOT con una extracción local o CODENET_ARCHIVE con el tar.gz y activar REBUILD_FROM_ARCHIVE. Una pasada secuencial puede tardar varios minutos. El archivo original no forma parte del paquete. La misma fuente y configuración deben reproducir la selección original.

## Pruebas

Desde la raíz: python -m pytest tests -q --junitxml=evidence/pytest.xml. Revisar las salidas del notebook y evidence/acceptance.json. La prueba de alteración trabaja sobre una copia y debe activar el fallo de integridad.

## Continuación

Ampliar ejercicios e incorporar muestras IA bajo los mismos enunciados precede al entrenamiento. No existen métricas de clasificación en esta iteración.
