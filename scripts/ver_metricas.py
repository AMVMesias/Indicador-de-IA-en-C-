"""Vista tabular de evidencias locales; no inicia ni inventa mediciones."""
from pathlib import Path
from datetime import datetime, timedelta, timezone
import argparse
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
FEATURE = ROOT / 'specs/001-curacion-codenet'


def load(relative):
    return json.loads((ROOT / relative).read_text(encoding='utf-8'))


def render_table(headers, rows):
    values = [list(map(str, headers)), *[list(map(str, row)) for row in rows]]
    widths = [max(len(row[i]) for row in values) for i in range(len(headers))]
    line = '+-' + '-+-'.join('-' * width for width in widths) + '-+'
    body = [line]
    for i, row in enumerate(values):
        body.append('| ' + ' | '.join(value.ljust(width) for value, width in zip(row, widths)) + ' |')
        if i == 0:
            body.append(line)
    body.append(line)
    return '\n'.join(body)


def markdown_table(headers, rows):
    def row(values):
        return '| ' + ' | '.join(str(value).replace('|', '\\|') for value in values) + ' |'
    return '\n'.join([row(headers), row(['---'] * len(headers)), *map(row, rows)])


def build():
    acceptance = load('evidence/acceptance.json')
    notebook = load('evidence/notebook_execution.json')
    original = load('evidence/full_source_selection.json')['full_selection_summary']
    setup = load('evidence/analytics_setup.json')
    tasks = (FEATURE / 'tasks.md').read_text(encoding='utf-8')
    spec = (FEATURE / 'spec.md').read_text(encoding='utf-8')
    completed = len(re.findall(r'^- \[[xX]\] T\d+', tasks, re.M))
    total = len(re.findall(r'^- \[[ xX]\] T\d+', tasks, re.M))
    checks = acceptance['checks']
    tests = acceptance['tests']
    passed = tests['tests'] - tests['failures'] - tests['errors'] - tests['skipped']
    effort = setup['retrospective_effort_person_hours']
    rows = [
        ['Dedicación total aproximada', f'{effort} horas-persona', 'Estimación retrospectiva'],
        ['Tareas completadas', f'{completed}/{total}', 'Estado registrado'],
        ['Historias definidas', str(len(re.findall(r'^### User Story ', spec, re.M))), 'Alcance definido'],
        ['Requisitos definidos', str(len(re.findall(r'^- \*\*FR-\d+\*\*', spec, re.M))), 'Alcance definido'],
        ['Códigos / ejercicios', f"{acceptance['selected']} / {len(acceptance['by_problem'])}", 'Evidencia de datos'],
        ['Entrenamiento / validación / prueba', ' / '.join(str(acceptance['by_split'][key]) for key in ['train', 'validation', 'test']), 'Evidencia de datos'],
        ['Controles cumplidos', f'{sum(value is True for value in checks.values())}/{len(checks)}', 'Evidencia de ejecución'],
        ['Pruebas aprobadas', f"{passed}/{tests['tests']}", 'Evidencia de ejecución'],
        ['Reproducción independiente', 'Coincide' if acceptance['independent_reproduction'] else 'No coincide', 'Evidencia de ejecución'],
        ['Selección original', f"{original['duration_seconds']} s", 'Medición guardada'],
        ['Notebook completo', f"{notebook['duration_seconds']} s", 'Medición guardada'],
    ]
    log = FEATURE / 'analytics/time/commands.md'
    entries = []
    if log.exists():
        for block in log.read_text(encoding='utf-8').split('## Command Execution')[1:]:
            values = dict(re.findall(r'^- \*\*([^*]+):\*\* `([^`]*)`', block, re.M))
            if all(key in values for key in ['Command', 'Start', 'End', 'Duration']):
                def local(value):
                    return datetime.fromisoformat(value.replace('Z', '+00:00')).astimezone(timezone(timedelta(hours=-5))).strftime('%Y-%m-%d %H:%M:%S')
                entries.append([values['Command'], local(values['Start']), local(values['End']), values['Duration']])
    sections = [('Métricas de la iteración 001', ['Métrica', 'Resultado', 'Naturaleza'], rows)]
    if entries:
        sections.append(('Revisiones posteriores registradas por Analytics', ['Actividad', 'Inicio (Bogotá)', 'Fin (Bogotá)', 'Duración'], entries))
    notes = ('La dedicación aproximada es una estimación retrospectiva. Los registros de Analytics '
             'miden revisiones posteriores, no el desarrollo original. Los tiempos guardados de selección '
             'y notebook corresponden a ejecuciones distintas y no se suman. La selección excluye la extracción previa del comprimido.')
    return sections, notes


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--guardar', action='store_true', help='Guarda también una matriz Markdown en evidence/.')
    args = parser.parse_args()
    sections, notes = build()
    for title, headers, rows in sections:
        print('\n' + title + '\n' + render_table(headers, rows))
    print('\n' + notes)
    if args.guardar:
        out = ROOT / 'evidence/matriz_metricas.md'
        content = '\n\n'.join('## ' + title + '\n\n' + markdown_table(headers, rows) for title, headers, rows in sections)
        out.write_text('# Matriz de métricas\n\n' + content + '\n\n' + notes + '\n', encoding='utf-8')
        print('\nMatriz guardada en: ' + str(out))
