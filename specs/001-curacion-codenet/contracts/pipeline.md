# Contrato del pipeline

## Entradas

run_pipeline(source_root, output_root, config) recibe una raíz con metadata/pNNNNN.csv y data/pNNNNN/C++/sNNNNNNNNN.cpp. extract_selected(archive, destination, problem_ids) lee un tar.gz y copia solo miembros regulares de rutas previstas. Los límites son 1 MiB por muestra y 256 MiB para la extracción. Ninguna función ejecuta C++.

## Salidas

manifest.csv contiene una fila por muestra; code/ conserva bytes originales; summary.json registra filtros; verification.json contiene checks y user_overlap. PipelineError describe fuente ausente, metadatos inválidos, configuración errónea, cuota insuficiente o extracción insegura.

## Determinismo y publicación

La misma entrada y configuración producen manifest.csv idéntico byte a byte, aunque cambie el orden de los CSV. La duración puede variar. La selección y sus controles preceden a la exportación. Una cuota insuficiente no publica un subconjunto final. La verificación usa errores explícitos, no aserciones eliminables como única protección.
