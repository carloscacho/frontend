'use client';
import { useState, useRef } from 'react';
import { PiUploadSimple, PiX, PiCheck, PiWarning, PiSpinner } from 'react-icons/pi';

/**
 * Modal for importing activities from CSV file
 * @param {Object} props
 * @param {React.RefObject} props.refModal - Reference to the dialog element
 * @param {Object} props.evento - Event object with id and name
 * @param {Function} props.onImport - Callback function called with parsed activities
 * @param {Function} props.onClose - Callback function when modal is closed
 */
export default function CsvImportModal({ refModal, evento, onImport, onClose }) {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    const resetState = () => {
        setFile(null);
        setParsedData([]);
        setErrors([]);
        setIsLoading(false);
        setImportResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetState();
        onClose?.();
        refModal?.current?.close();
    };

    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            return { data: [], errors: ['Arquivo CSV deve ter cabeçalho e pelo menos uma linha de dados'] };
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredFields = ['nome'];
        const missingFields = requiredFields.filter(f => !headers.includes(f));

        if (missingFields.length > 0) {
            return { data: [], errors: [`Campos obrigatórios faltando: ${missingFields.join(', ')}`] };
        }

        const data = [];
        const parseErrors = [];

        // Helper to validate time format (HH:MM)
        const isValidTime = (time) => {
            if (!time || typeof time !== 'string') return false;
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
            return timeRegex.test(time.trim());
        };

        // Helper to validate date format (YYYY-MM-DD)
        const isValidDate = (date) => {
            if (!date || typeof date !== 'string') return false;
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            return dateRegex.test(date.trim());
        };

        // Helper to normalize time (add leading zero if needed)
        const normalizeTime = (time) => {
            if (!time) return null;
            const parts = time.trim().split(':');
            if (parts.length !== 2) return null;
            const hours = parts[0].padStart(2, '0');
            const minutes = parts[1].padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseCSVLine(line);
            const row = {};

            headers.forEach((header, index) => {
                row[header] = values[index]?.trim() || '';
            });

            // Validate required fields
            if (!row.nome) {
                parseErrors.push(`Linha ${i + 1}: Campo 'nome' é obrigatório`);
                continue;
            }

            // Build activity object
            const atividade = {
                nome: row.nome,
                descricao: row.descricao || null,
                observacao: row.observacao || null,
                limite: row.limite ? parseInt(row.limite, 10) : null,
                fk_evento: evento.id,
            };

            // Add date only if both data and hora are valid
            const hasValidDate = isValidDate(row.data);
            const hasValidHora = isValidTime(row.hora);

            if (hasValidDate && hasValidHora) {
                atividade.data_atividade = {
                    data: row.data.trim(),
                    hora: normalizeTime(row.hora),
                    duracao: isValidTime(row.duracao) ? normalizeTime(row.duracao) : null,
                };
            } else if (row.data || row.hora) {
                // Warn if partial date/time info provided
                if (row.data && !hasValidDate) {
                    parseErrors.push(`Linha ${i + 1}: Data '${row.data}' inválida (use YYYY-MM-DD)`);
                }
                if (row.hora && !hasValidHora) {
                    parseErrors.push(`Linha ${i + 1}: Hora '${row.hora}' inválida (use HH:MM)`);
                }
            }

            data.push(atividade);
        }

        return { data, errors: parseErrors };
    };

    // Parse CSV line handling quoted values
    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            setErrors(['Por favor, selecione um arquivo CSV']);
            return;
        }

        setFile(selectedFile);
        setErrors([]);
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text === 'string') {
                const { data, errors: parseErrors } = parseCSV(text);
                setParsedData(data);
                setErrors(parseErrors);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        if (parsedData.length === 0) return;

        setIsLoading(true);
        try {
            const result = await onImport(parsedData);
            setImportResult(result);
        } catch (error) {
            setErrors([error.message || 'Erro ao importar atividades']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <dialog ref={refModal} className="modal">
            <div className="modal-box max-w-4xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">
                        Importar Atividades - {evento?.nome || 'Evento'}
                    </h3>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={handleClose}
                    >
                        <PiX size={20} />
                    </button>
                </div>

                {/* Import Result */}
                {importResult && (
                    <div className="mb-6">
                        <div className="alert alert-success mb-3">
                            <PiCheck size={20} />
                            <span className="font-semibold">{importResult.success?.length || 0} atividades importadas com sucesso!</span>
                        </div>

                        {/* Info about pending activities */}
                        {importResult.success?.length > 0 && (
                            <div className="alert alert-info mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <div>
                                    <p className="font-semibold">Próximos passos:</p>
                                    <p className="text-sm">As atividades importadas estão <strong>pendentes de finalização</strong>. Acesse a página de <strong>Atividades</strong> para adicionar palestrantes e locais.</p>
                                </div>
                            </div>
                        )}

                        {importResult.errors?.length > 0 && (
                            <div className="alert alert-warning">
                                <PiWarning size={20} />
                                <div>
                                    <p className="font-semibold">{importResult.errors.length} erros:</p>
                                    <ul className="list-disc list-inside text-sm mt-1">
                                        {importResult.errors.slice(0, 5).map((err, i) => (
                                            <li key={i}>{err.nome}: {err.error}</li>
                                        ))}
                                        {importResult.errors.length > 5 && (
                                            <li>...e mais {importResult.errors.length - 5} erros</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* File Upload */}
                {!importResult && (
                    <>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Selecione o arquivo CSV
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="file-input file-input-bordered w-full"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Formato: nome, descricao, limite, data (YYYY-MM-DD), hora (HH:MM), duracao (HH:MM), observacao
                            </p>
                        </div>

                        {/* Errors */}
                        {errors.length > 0 && (
                            <div className="alert alert-error mb-4">
                                <PiWarning size={20} />
                                <ul className="list-disc list-inside">
                                    {errors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Preview Table */}
                        {parsedData.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold mb-2">
                                    Preview ({parsedData.length} atividades)
                                </h4>
                                <div className="overflow-x-auto max-h-64">
                                    <table className="table table-sm table-zebra">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Nome</th>
                                                <th>Descrição</th>
                                                <th>Limite</th>
                                                <th>Data</th>
                                                <th>Hora</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.slice(0, 10).map((item, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td className="font-medium">{item.nome}</td>
                                                    <td className="truncate max-w-[200px]">{item.descricao || '-'}</td>
                                                    <td>{item.limite || '∞'}</td>
                                                    <td>{item.data_atividade?.data || '-'}</td>
                                                    <td>{item.data_atividade?.hora || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {parsedData.length > 10 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            ...e mais {parsedData.length - 10} atividades
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Actions */}
                <div className="modal-action">
                    <button
                        className="btn btn-ghost"
                        onClick={handleClose}
                    >
                        {importResult ? 'Fechar' : 'Cancelar'}
                    </button>
                    {!importResult && parsedData.length > 0 && (
                        <button
                            className="btn btn-primary"
                            onClick={handleImport}
                            disabled={isLoading || errors.length > 0}
                        >
                            {isLoading ? (
                                <>
                                    <PiSpinner className="animate-spin" size={20} />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <PiUploadSimple size={20} />
                                    Importar {parsedData.length} atividades
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
}
