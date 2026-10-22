# Taller SDD aplicado a la preparación de datos de la tesis

**Mesias Mariscal y Denise Rea**  
GEST. PROYECTOS DE SOFTWARE · NRC 36907 · ESPE

## Notebook

Abrir notebooks/01_curacion_codenet.ipynb en Jupyter o en Visual Studio Code con su extensión Jupyter. Seleccionar un entorno Python 3.12 que contenga las dependencias. Desde la raíz del proyecto:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-notebook.txt
.\.venv\Scripts\python.exe scripts/execute_notebook.py
```

El modo predeterminado reproduce las cincuenta muestras incluidas, sin GPU ni acceso al comprimido de 8,34 GB. El pipeline usa biblioteca estándar. La ejecución observada del notebook y sus pruebas está registrada en evidence/. Para abrir la interfaz clásica, instalar jupyterlab en el entorno y ejecutar python -m jupyter lab.

## Escala del experimento

La primera selección procesó 75.699 registros de metadatos de cinco problemas, identificó 13.182 candidatos elegibles por metadatos y conservó 50 muestras. El subconjunto reducido contiene las cincuenta filas originales seleccionadas y permite reproducir el manifiesto; no representa una nueva exploración del corpus completo. Los conteos de archivos rechazados describen únicamente el recorrido necesario para completar la cuota.

config/iteration1.json controla semilla, cuota, ejercicios y particiones. La selección actual reserva tres ejercicios para entrenamiento, uno para validación y uno para prueba. La cuota es ampliable. El experimento final de la tesis requiere veinte ejercicios y muestras IA bajo los mismos enunciados; sus particiones deben quedar fijadas antes de entrenar.

## Fuente completa

El notebook admite CODENET_ROOT para una raíz expandida. CODENET_ARCHIVE y REBUILD_FROM_ARCHIVE activan una lectura secuencial segura del tar.gz; el destino data/archive_cache debe estar vacío. La extracción puede tardar varios minutos. El comprimido original permanece en Downloads y no se duplica en esta entrega.

## Verificación

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q --junitxml=evidence/pytest.xml
```

evidence/full_source_selection.json conserva la selección original y las huellas de los metadatos. evidence/acceptance.json contiene controles y reproducción; evidence/notebook_execution.json registra celdas ejecutadas. La alteración de una copia de muestra activa un fallo de integridad en las pruebas.

## Spec Kit

Spec Kit 1.2.2 está configurado con la integración oficial de Codex. Las habilidades están en .agents/skills y los artefactos en .specify/ y specs/001-curacion-codenet/. Desde una sesión de Codex abierta en esta carpeta se pueden invocar $speckit-constitution, $speckit-specify, $speckit-plan, $speckit-tasks, $speckit-implement y $speckit-converge. Las habilidades del proyecto estarán disponibles al abrirlo en una nueva sesión o turno que las detecte.

El nombre Speckit-coverage corresponde al entregable académico de auditoría. La versión oficial instalada utiliza converge para revisar completitud; no incluye un comando central coverage. specs/001-curacion-codenet/coverage.md contiene la matriz de requisitos y su evidencia.

## Medición con Spec Kit Analytics

Analytics 0.1.0 está instalada y habilitada para Spec Kit 1.2.2. Requiere Node 24 o posterior. Registra el intervalo entre los hooks de inicio y cierre de las fases ejecutadas desde las habilidades de Codex. No cronometra toda la conversación ni el trabajo manual fuera de esas fases.

Para consultar los registros desde Codex, usar `$speckit-analytics-show`. Desde PowerShell, en la raíz del proyecto:

```powershell
node .specify/extensions/analytics/src/show.ts
```

El resumen admite un identificador de especificación como argumento, por ejemplo `001-curacion-codenet`. Los registros de tiempo quedan en `specs/<especificacion>/analytics/time/commands.md`. Las estimaciones de esfuerzo generadas por IA quedan separadas en `analytics/time/humanEstimates/`. Esas estimaciones y sus comparaciones de ahorro no representan horas humanas medidas.

Para una vista en tablas que reúna las métricas del incremento y las revisiones registradas por Analytics, ejecutar `python scripts/ver_metricas.py`. La opción `--guardar` genera también `evidence/matriz_metricas.md`, que puede abrirse en la vista previa Markdown de VS Code. Esta vista local consulta las evidencias; no inicia mediciones ni recalcula el esfuerzo humano.

La instalación posterior al desarrollo no recupera los tiempos de la primera iteración. Su referencia de 3 horas-persona sigue siendo una aproximación retrospectiva. El estado inicial del resumen indica que aún no existen datos de Analytics. La comprobación del temporizador utilizó una carpeta aislada; `evidence/analytics_setup.json` registra el resultado de esa validación.

Las fases deben ejecutarse secuencialmente: la extensión usa un único archivo de temporizador activo por proyecto. Los ajustes locales permiten mostrar resultados con Node en Windows y añaden hooks para constitution y converge. Una actualización de la extensión puede requerir volver a aplicar estos ajustes. Al copiar el proyecto a otro equipo, instalar las dependencias locales sin scripts de instalación:

```powershell
npm ci --omit=dev --ignore-scripts --prefix .specify/extensions/analytics
```

## Atribución

IBM Project CodeNet, con entregas de AIZU Online Judge y AtCoder. El subconjunto conserva la licencia CDLA Permissive 2.0 y su atribución en data/source_subset/. HISTORICO_CODENET expresa procedencia histórica y no certifica autoría humana individual. No se ejecuta el código de terceros.
# Indicador-de-IA-en-C-
