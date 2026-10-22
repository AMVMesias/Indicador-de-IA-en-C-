"""Aceptación del incremento 001, con datos sintéticos que no simulan métricas IA."""
import csv
import io
import json
import sys
import tarfile
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'src'))
from codenet_pipeline import PipelineError, extract_selected, run_pipeline, select_samples, verify_manifest

FIELDS=['submission_id','problem_id','user_id','date','language','original_language','filename_ext','status']

@pytest.fixture
def fixture(tmp_path):
    root=tmp_path/'Project_CodeNet'
    config={'seed':7,'samples_per_problem':2,'cutoff_utc':'2021-05-01T00:00:00Z',
            'label':'HISTORICO_CODENET','label_basis':'Procedencia histórica; autoría no verificada',
            'problems':{'p00001':{'split':'train'},'p00002':{'split':'validation'},'p00003':{'split':'test'}}}
    (root/'metadata').mkdir(parents=True)
    for p in config['problems']:
        rows=[]
        for j in range(5):
            sid=f's{int(p[1:])*100+j:09d}'
            row=dict(zip(FIELDS,[sid,p,f'u{j:09d}','1500000000','C++','C++14','cpp','Accepted']))
            rows.append(row)
            path=root/'data'/p/'C++'/f'{sid}.cpp';path.parent.mkdir(parents=True,exist_ok=True)
            path.write_bytes(f'// {p} {j}\r\nint main(){{return {j};}}\r\n'.encode())
        write_csv(root/'metadata'/f'{p}.csv',rows)
    return root,config,tmp_path/'out'

def write_csv(path,rows):
    with path.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(rows)

def read_csv(path):
    with path.open(encoding='utf-8',newline='') as f:return list(csv.DictReader(f))

def test_valid_selection_and_exports(fixture):
    root,cfg,out=fixture
    rows,summary,verification=run_pipeline(root,out,cfg)
    assert len(rows)==6
    assert all(verification['checks'].values())
    assert summary['by_split']=={'train':2,'validation':2,'test':2}
    assert len(list((out/'code').rglob('*.cpp')))==6
    assert (out/'manifest.csv').is_file() and (out/'summary.json').is_file()
    original=root/rows[0]['source_path']; exported=out/rows[0]['curated_path']
    assert original.read_bytes()==exported.read_bytes()

def test_reordered_metadata_is_deterministic(fixture):
    root,cfg,out=fixture
    run_pipeline(root,out,cfg); original=(out/'manifest.csv').read_bytes()
    for p in cfg['problems']:
        path=root/'metadata'/f'{p}.csv';write_csv(path,list(reversed(read_csv(path))))
    run_pipeline(root,out.parent/'again',cfg)
    assert original==(out.parent/'again'/'manifest.csv').read_bytes()

def test_missing_source(fixture):
    root,cfg,out=fixture
    with pytest.raises(PipelineError,match='existe'):run_pipeline(root/'missing',out,cfg)

def test_invalid_config_split(fixture):
    root,cfg,out=fixture;cfg['problems']['p00001']['split']='wrong'
    with pytest.raises(PipelineError,match='partición'):run_pipeline(root,out,cfg)

def test_insufficient_quota_does_not_publish(fixture):
    root,cfg,out=fixture;cfg['samples_per_problem']=6
    with pytest.raises(PipelineError,match='insuficiente'):run_pipeline(root,out,cfg)
    assert not (out/'manifest.csv').exists()

def test_filters_status_language_and_date(fixture):
    root,cfg,out=fixture;p=root/'metadata/p00001.csv';rows=read_csv(p)
    rows[0]['status']='Wrong Answer';rows[1]['language']='Python';rows[2]['date']='2000000000'
    write_csv(p,rows)
    selected,stats=select_samples(root,cfg)
    assert {r['submission_id'] for r in selected if r['problem_id']=='p00001'}=={rows[3]['submission_id'],rows[4]['submission_id']}
    assert stats['rejected']['status']==1 and stats['rejected']['language']==1 and stats['rejected']['date_cutoff']==1

def test_duplicate_normalized_code_excluded(fixture):
    root,cfg,out=fixture;p=root/'metadata/p00001.csv';rows=read_csv(p)
    a=root/'data/p00001/C++'/f"{rows[0]['submission_id']}.cpp"
    b=root/'data/p00001/C++'/f"{rows[1]['submission_id']}.cpp"
    b.write_bytes(a.read_bytes().replace(b'\r\n',b'\n'))
    selected,stats=select_samples(root,cfg)
    hashes=[r['normalized_sha256'] for r in selected]
    assert len(hashes)==len(set(hashes))

def test_unique_user_per_problem(fixture):
    root,cfg,out=fixture;p=root/'metadata/p00001.csv';rows=read_csv(p)
    rows[1]['user_id']=rows[0]['user_id'];write_csv(p,rows)
    selected,_=select_samples(root,cfg)
    users=[r['user_id'] for r in selected if r['problem_id']=='p00001']
    assert len(users)==len(set(users))==2

def test_missing_columns_fail(fixture):
    root,cfg,out=fixture;(root/'metadata/p00001.csv').write_text('submission_id\ns000000001\n')
    with pytest.raises(PipelineError,match='campos'):run_pipeline(root,out,cfg)

def test_invalid_date_missing_and_empty_files(fixture):
    root,cfg,out=fixture;p=root/'metadata/p00001.csv';rows=read_csv(p)
    rows[0]['date']='bad';write_csv(p,rows)
    (root/'data/p00001/C++'/f"{rows[1]['submission_id']}.cpp").unlink()
    (root/'data/p00001/C++'/f"{rows[2]['submission_id']}.cpp").write_bytes(b'')
    _,stats=select_samples(root,cfg)
    assert stats['rejected']['invalid_date']==1
    assert stats['rejected']['missing_file']==1 and stats['rejected']['empty_file']==1

def test_corruption_detected(fixture):
    root,cfg,out=fixture;rows,_,_=run_pipeline(root,out,cfg)
    (out/rows[0]['curated_path']).write_bytes(b'alterado')
    result=verify_manifest(rows,out,cfg)
    assert result['checks']['integrity'] is False and rows[0]['submission_id'] in result['integrity_errors']

def test_partition_tampering_detected(fixture):
    root,cfg,out=fixture;rows,_,_=run_pipeline(root,out,cfg)
    rows[0]['split']='test' if rows[0]['split']!='test' else 'train'
    assert verify_manifest(rows,out,cfg)['checks']['partition_assignment'] is False

@pytest.mark.parametrize('name,kind',[('../escape.cpp','file'),('Project_CodeNet/data/p00001/C++/s000000001.cpp','link')])
def test_unsafe_archive_rejected(tmp_path,name,kind):
    archive=tmp_path/'unsafe.tar.gz'
    with tarfile.open(archive,'w:gz') as t:
        member=tarfile.TarInfo(name)
        if kind=='link':member.type=tarfile.SYMTYPE;member.linkname='elsewhere'
        else:member.size=1
        t.addfile(member,io.BytesIO(b'x') if kind=='file' else None)
    with pytest.raises(PipelineError):extract_selected(archive,tmp_path/'extracted',['p00001'])
    assert not (tmp_path/'escape.cpp').exists()

def test_safe_archive_can_be_read(tmp_path):
    archive=tmp_path/'safe.tar.gz'
    name='Project_CodeNet/data/p00001/C++/s000000001.cpp'
    with tarfile.open(archive,'w:gz') as t:
        member=tarfile.TarInfo(name);member.size=3;t.addfile(member,io.BytesIO(b'abc'))
    result=extract_selected(archive,tmp_path/'extracted',['p00001'])
    assert (result/'data/p00001/C++/s000000001.cpp').read_bytes()==b'abc'

def test_oversized_archive_rejected(tmp_path):
    archive=tmp_path/'big.tar.gz'
    with tarfile.open(archive,'w:gz') as t:
        member=tarfile.TarInfo('Project_CodeNet/data/p00001/C++/s000000001.cpp');member.size=20;t.addfile(member,io.BytesIO(b'x'*20))
    with pytest.raises(PipelineError,match='límite'):extract_selected(archive,tmp_path/'extracted',['p00001'],max_file_bytes=10)
