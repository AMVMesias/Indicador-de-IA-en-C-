"""Curación reproducible de CodeNet. No compila ni ejecuta programas de terceros."""
from __future__ import annotations

import csv
import hashlib
import json
import re
import tarfile
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

VERSION = '1.0.0'
MAX_FILE_BYTES = 1048576
MAX_TOTAL_BYTES = 268435456
REQUIRED = {'submission_id','problem_id','user_id','date','language','original_language','filename_ext','status'}
MANIFEST_FIELDS = ['submission_id','problem_id','problem_title','topic','user_id','date','date_utc',
                   'language','original_language','status','source_path','curated_path','code_bytes',
                   'sha256','normalized_sha256','split','label','label_basis']


class PipelineError(ValueError):
    """Entrada inválida o condición de aceptación incumplida."""


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def normalize_endings(data: bytes) -> bytes:
    return data.replace(b'\r\n', b'\n').replace(b'\r', b'\n')


def validate_config(config: dict) -> datetime:
    try:
        cutoff = datetime.fromisoformat(config['cutoff_utc'].replace('Z','+00:00'))
        if cutoff.tzinfo is None or cutoff.utcoffset().total_seconds() != 0:
            raise ValueError('fecha sin UTC')
        quota = config['samples_per_problem']
        if isinstance(quota,bool) or not isinstance(quota,int) or quota < 1:
            raise ValueError('cuota no positiva')
        if not isinstance(config['seed'],int) or not config['problems']:
            raise ValueError('semilla o ejercicios inválidos')
        for pid,info in config['problems'].items():
            if not re.fullmatch(r'p\d{5}',pid):
                raise ValueError('identificador de problema inválido')
            if info['split'] not in {'train','validation','test'}:
                raise ValueError('partición inválida')
        if config.get('label') != 'HISTORICO_CODENET' or not config.get('label_basis'):
            raise ValueError('etiqueta histórica o fundamento ausente')
    except (KeyError,TypeError,ValueError,AttributeError) as exc:
        raise PipelineError(f'Configuración inválida: {exc}') from exc
    return cutoff


def safe_path(root: Path, relative: str) -> Path:
    root = Path(root).absolute()
    rel = PurePosixPath(relative)
    if '\\' in relative or ':' in relative or rel.is_absolute() or '..' in rel.parts:
        raise PipelineError(f'Ruta insegura: {relative}')
    candidate = root.joinpath(*rel.parts)
    resolved_root = root.resolve()
    try:
        candidate.resolve().relative_to(resolved_root)
    except ValueError as exc:
        raise PipelineError(f'Ruta fuera de la fuente: {relative}') from exc
    # Verifica también componentes intermedios y la propia raíz.
    for item in [root,*[root.joinpath(*rel.parts[:i]) for i in range(1,len(rel.parts)+1)]]:
        if item.is_symlink() or (hasattr(item,'is_junction') and item.is_junction()):
            raise PipelineError(f'Enlace no permitido: {relative}')
    return candidate


def extract_selected(archive: Path, destination: Path, problem_ids, *,
                     max_file_bytes=MAX_FILE_BYTES, max_total_bytes=MAX_TOTAL_BYTES) -> Path:
    """Lee secuencialmente el tar.gz; nunca usa extractall ni acepta enlaces."""
    archive,destination=Path(archive),Path(destination)
    if not archive.is_file():
        raise PipelineError(f'El archivo no existe: {archive}')
    ids=set(problem_ids)
    if not ids or any(not re.fullmatch(r'p\d{5}',p) for p in ids):
        raise PipelineError('Identificador de problema inválido')
    total=0
    try:
        with tarfile.open(archive,'r|gz') as tar:
            for member in tar:
                # Evita acumular millones de objetos TarInfo del corpus completo.
                tar.members.clear()
                rel=member.name
                safe_path(destination,rel)
                path=PurePosixPath(rel)
                parts=path.parts
                wanted=(len(parts)==3 and parts[0]=='Project_CodeNet' and
                        parts[1]=='metadata' and parts[2] in {p+'.csv' for p in ids})
                wanted=wanted or (len(parts)==5 and parts[0]=='Project_CodeNet' and
                       parts[1]=='data' and parts[2] in ids and parts[3]=='C++' and
                       bool(re.fullmatch(r's\d{9}\.cpp',parts[4])))
                if not wanted:
                    continue
                if not member.isfile() or member.issym() or member.islnk():
                    raise PipelineError(f'Miembro no regular: {rel}')
                # Los CSV de metadatos pueden superar el límite de un programa.
                limit=32*MAX_FILE_BYTES if parts[1]=='metadata' else max_file_bytes
                if member.size<0 or member.size>limit or total+member.size>max_total_bytes:
                    raise PipelineError(f'El miembro supera el límite: {rel}')
                target=safe_path(destination,rel)
                if target.exists():
                    raise PipelineError(f'El destino ya contiene un miembro: {rel}')
                stream=tar.extractfile(member)
                if stream is None:
                    raise PipelineError(f'Miembro ilegible: {rel}')
                content=stream.read(limit+1)
                if len(content)!=member.size:
                    raise PipelineError(f'Tamaño inconsistente: {rel}')
                target.parent.mkdir(parents=True,exist_ok=True)
                target.write_bytes(content);total+=len(content)
    except (tarfile.TarError,OSError) as exc:
        raise PipelineError(f'No fue posible leer la fuente: {exc}') from exc
    return destination/'Project_CodeNet'


def select_samples(source_root: Path, config: dict):
    cutoff=validate_config(config)
    source_root=Path(source_root)
    if not source_root.is_dir():
        raise PipelineError(f'La fuente no existe: {source_root}')
    safe_path(source_root,'metadata')
    stats={'metadata_rows':0,'eligible_rows':0,'files_read':0,'rejected':Counter()}
    selected=[];seen_ids=set();seen_hashes=set()
    quota=config['samples_per_problem']
    for pid,info in sorted(config['problems'].items()):
        metadata=safe_path(source_root,f'metadata/{pid}.csv')
        if not metadata.is_file():
            raise PipelineError(f'Los metadatos no existen: {pid}')
        try:
            with metadata.open(encoding='utf-8-sig',newline='') as f:
                reader=csv.DictReader(f)
                if not REQUIRED.issubset(reader.fieldnames or []):
                    raise PipelineError(f'Faltan campos de metadatos: {pid}')
                candidates=[]
                for row in reader:
                    stats['metadata_rows']+=1
                    if any(not row.get(k) for k in REQUIRED):
                        stats['rejected']['missing_fields']+=1;continue
                    if row['problem_id']!=pid or not re.fullmatch(r's\d{9}',row['submission_id']) or not re.fullmatch(r'u\d{9}',row['user_id']):
                        stats['rejected']['invalid_identifier']+=1;continue
                    if row['language']!='C++' or row['filename_ext']!='cpp':
                        stats['rejected']['language']+=1;continue
                    if row['status']!='Accepted':
                        stats['rejected']['status']+=1;continue
                    try:
                        timestamp=int(row['date'])
                        if timestamp<0:raise ValueError('negative')
                        dt=datetime.fromtimestamp(timestamp,timezone.utc)
                    except (ValueError,OverflowError,OSError):
                        stats['rejected']['invalid_date']+=1;continue
                    if dt>=cutoff:
                        stats['rejected']['date_cutoff']+=1;continue
                    row['date_utc']=dt.isoformat().replace('+00:00','Z')
                    candidates.append(row)
        except (OSError,UnicodeError,csv.Error) as exc:
            raise PipelineError(f'Metadatos ilegibles: {pid}: {exc}') from exc
        candidates.sort(key=lambda r:(digest(f"{config['seed']}:{r['submission_id']}".encode()),r['submission_id']))
        stats['eligible_rows']+=len(candidates)
        users=set();group=[]
        for row in candidates:
            sid=row['submission_id'];uid=row['user_id']
            if sid in seen_ids:
                stats['rejected']['duplicate_submission']+=1;continue
            if uid in users:
                stats['rejected']['repeated_user']+=1;continue
            relative=f'data/{pid}/C++/{sid}.cpp'
            code=safe_path(source_root,relative)
            if not code.is_file():
                stats['rejected']['missing_file']+=1;continue
            if code.stat().st_size>MAX_FILE_BYTES:
                stats['rejected']['oversized_file']+=1;continue
            content=code.read_bytes();stats['files_read']+=1
            if not content.strip():
                stats['rejected']['empty_file']+=1;continue
            try:content.decode('utf-8-sig')
            except UnicodeDecodeError:
                stats['rejected']['invalid_encoding']+=1;continue
            normalized=digest(normalize_endings(content))
            if normalized in seen_hashes:
                stats['rejected']['duplicate_code']+=1;continue
            enriched={k:row[k] for k in ['submission_id','problem_id','user_id','date','date_utc','language','original_language','status']}
            enriched.update(problem_title=info.get('title',pid),topic=info.get('topic',''),
                            source_path=relative,curated_path=f'code/{pid}/{sid}.cpp',
                            code_bytes=len(content),sha256=digest(content),normalized_sha256=normalized,
                            split=info['split'],label=config['label'],label_basis=config['label_basis'])
            # Se validan los candidatos hasta completar la cuota: las estadísticas
            # de archivo describen ese recorrido, no una auditoría de todo CodeNet.
            group.append(enriched);users.add(uid);seen_ids.add(sid);seen_hashes.add(normalized)
            if len(group)==quota:break
        if len(group)!=quota:
            raise PipelineError(f'Cuota insuficiente para {pid}: {len(group)} de {quota}')
        selected.extend(sorted(group,key=lambda r:r['submission_id']))
    stats['rejected']=dict(sorted(stats['rejected'].items()))
    return selected,stats


def verify_manifest(rows,output_root: Path,config: dict):
    cutoff=validate_config(config);out=Path(output_root)
    by_problem=Counter(r['problem_id'] for r in rows)
    fields=all(all(str(r.get(k,'')) for k in MANIFEST_FIELDS if k!='topic') for r in rows)
    eligible=True;integrity_errors=[]
    for row in rows:
        try:
            eligible=eligible and (row['language']=='C++' and row['status']=='Accepted' and
                     datetime.fromtimestamp(int(row['date']),timezone.utc)<cutoff)
            path=safe_path(out,row['curated_path']);content=path.read_bytes()
            if digest(content)!=row['sha256'] or digest(normalize_endings(content))!=row['normalized_sha256'] or len(content)!=int(row['code_bytes']):
                integrity_errors.append(row['submission_id'])
        except (KeyError,ValueError,OSError,PipelineError):
            integrity_errors.append(row.get('submission_id','unknown'));eligible=False
    partition_assignment=all(r['problem_id'] in config['problems'] and r['split']==config['problems'][r['problem_id']]['split'] for r in rows)
    unique_users=all(len({r['user_id'] for r in rows if r['problem_id']==pid})==count for pid,count in by_problem.items())
    splits={s:{r['problem_id'] for r in rows if r['split']==s} for s in ['train','validation','test']}
    no_shared=not any(splits[a]&splits[b] for a,b in [('train','validation'),('train','test'),('validation','test')])
    user_sets={s:{r['user_id'] for r in rows if r['split']==s} for s in splits}
    user_overlap={f'{a}/{b}':len(user_sets[a]&user_sets[b]) for a,b in [('train','validation'),('train','test'),('validation','test')]}
    checks={
        'quota':by_problem==Counter({p:config['samples_per_problem'] for p in config['problems']}),
        'required_fields':fields,
        'eligibility':eligible,
        'unique_submission_ids':len({r['submission_id'] for r in rows})==len(rows),
        'unique_normalized_hashes':len({r['normalized_sha256'] for r in rows})==len(rows),
        'unique_users_per_problem':unique_users,
        'partition_assignment':partition_assignment,
        'no_shared_problems':no_shared,
        'integrity':not integrity_errors,
        'historical_label':all(r['label']=='HISTORICO_CODENET' and r['label_basis'] for r in rows),
    }
    return {'checks':checks,'integrity_errors':integrity_errors,'user_overlap':user_overlap,
            'all_passed':all(checks.values())}


def dump_json(path: Path,content):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(content,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')


def run_pipeline(source_root: Path,output_root: Path,config: dict):
    start=time.perf_counter();source_root=Path(source_root);output_root=Path(output_root)
    # La cuota se completa antes de publicar resultados.
    rows,stats=select_samples(source_root,config)
    for row in rows:
        src=safe_path(source_root,row['source_path']);dst=safe_path(output_root,row['curated_path'])
        dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(src.read_bytes())
    verification=verify_manifest(rows,output_root,config)
    if not verification['all_passed']:
        raise PipelineError(f'Controles incumplidos: {verification}')
    output_root.mkdir(parents=True,exist_ok=True)
    with (output_root/'manifest.csv').open('w',encoding='utf-8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=MANIFEST_FIELDS,lineterminator='\n');writer.writeheader();writer.writerows(rows)
    summary={**stats,'pipeline_version':VERSION,'selected':len(rows),'seed':config['seed'],
             'by_problem':dict(Counter(r['problem_id'] for r in rows)),
             'by_split':dict(Counter(r['split'] for r in rows)),
             'config_sha256':digest(json.dumps(config,sort_keys=True,ensure_ascii=False).encode()),
             'manifest_sha256':digest((output_root/'manifest.csv').read_bytes()),
             'duration_seconds':round(time.perf_counter()-start,4),
             'classification_training_performed':False}
    dump_json(output_root/'summary.json',summary);dump_json(output_root/'verification.json',verification)
    return rows,summary,verification
