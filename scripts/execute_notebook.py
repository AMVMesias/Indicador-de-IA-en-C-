"""Ejecuta todas las celdas en un kernel nuevo con el Python activo."""
import asyncio
import json
import os
import sys
import tempfile
import time
from pathlib import Path

import nbformat
from nbclient import NotebookClient
from jupyter_client import AsyncKernelManager
from jupyter_client.kernelspec import KernelSpecManager

if os.name == 'nt':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

root=Path(__file__).resolve().parents[1]
path=root/'notebooks/01_curacion_codenet.ipynb'
notebook=nbformat.read(path,as_version=4)
started=time.perf_counter()
with tempfile.TemporaryDirectory(prefix='codenet-kernel-') as folder:
    spec=Path(folder)/'python3';spec.mkdir()
    (spec/'kernel.json').write_text(json.dumps({'argv':[sys.executable,'-m','ipykernel_launcher','-f','{connection_file}'],
                                              'display_name':'Python 3','language':'python'}))
    manager=AsyncKernelManager(kernel_name='python3',kernel_spec_manager=KernelSpecManager(kernel_dirs=[folder]))
    client=NotebookClient(notebook,km=manager,timeout=180,resources={'metadata':{'path':str(root)}},allow_errors=False)
    try:
        client.execute()
    finally:
        if manager.has_kernel:
            asyncio.run(manager.shutdown_kernel(now=True))
nbformat.write(notebook,path)
code_cells=[c for c in notebook.cells if c.cell_type=='code']
result={'executed_code_cells':len(code_cells),'total_cells':len(notebook.cells),
        'all_executed':all(c.execution_count is not None for c in code_cells),
        'error_outputs':sum(o.output_type=='error' for c in code_cells for o in c.get('outputs',[])),
        'duration_seconds':round(time.perf_counter()-started,3),'python':sys.version.split()[0]}
(root/'evidence/notebook_execution.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
