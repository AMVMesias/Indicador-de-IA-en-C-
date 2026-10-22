# Modelo de datos

## Configuración

seed es entero. samples_per_problem es entero mayor que cero. cutoff_utc es fecha UTC. Cada clave de problems cumple p seguido de cinco dígitos y tiene title, topic y split. split pertenece a train, validation o test.

## Registro de origen

submission_id, problem_id, user_id, date, language, original_language, filename_ext y status son obligatorios. submission_id cumple s seguido de nueve dígitos; user_id cumple u seguido de nueve dígitos. date es Unix no negativo. La elegibilidad requiere language=C++, filename_ext=cpp y status=Accepted. source_path es relativo, permanece dentro de la fuente y no atraviesa enlaces.

## Muestra curada

submission_id es único. sha256 identifica bytes originales; normalized_sha256 identifica bytes con finales LF. code_bytes es mayor que cero y no supera 1048576. label=HISTORICO_CODENET. label_basis expresa procedencia histórica con autoría individual no verificada. curated_path es relativo. La fecha ISO deriva del Unix original.

## Verificación

El resumen conserva candidatos, elegibles, rechazos y distribuciones. Los controles cubren cuota, campos, elegibilidad, usuarios por ejercicio, huellas, particiones, integridad y etiqueta. user_overlap registra usuarios compartidos entre particiones; no acredita independencia por autor.
