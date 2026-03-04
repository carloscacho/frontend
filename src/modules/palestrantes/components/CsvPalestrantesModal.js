'use client';
import { useState, useRef } from 'react';
import { PiUploadSimple, PiX, PiCheck, PiWarning, PiSpinner, PiUserPlus, PiLink } from 'react-icons/pi';

/**
 * Modal for importing palestrantes from CSV file
 */
export default function CsvPalestrantesModal({ refModal, evento, onImport, onClose }) {
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

    // Validate email format
    const isValidEmail = (email) => {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            return { data: [], errors: ['Arquivo CSV deve ter cabeçalho e pelo menos uma linha de dados'] };
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredFields = ['nome', 'email'];
        const missingFields = requiredFields.filter(f => !headers.includes(f));

        if (missingFields.length > 0) {
            return { data: [], errors: [`Campos obrigatórios faltando: ${missingFields.join(', ')}`] };
        }

        const data = [];
        const parseErrors = [];

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
            if (!row.email) {
                parseErrors.push(`Linha ${i + 1}: Campo 'email' é obrigatório`);
                continue;
            }
            if (!isValidEmail(row.email)) {
                parseErrors.push(`Linha ${i + 1}: Email '${row.email}' é inválido`);
                continue;
            }

            // Build palestrante object
            const palestrante = {
                nome: row.nome,
                email: row.email.toLowerCase(),
                instituicao: row.instituicao || null,
            };

            data.push(palestrante);
        }

        return { data, errors: parseErrors };
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
            setErrors([error.message || 'Erro ao importar palestrantes']);
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
                        Importar Palestrantes - {evento?.nome || 'Evento'}
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
                    <div className="mb-6 space-y-3">
                        {importResult.created?.length > 0 && (
                            <div className="alert alert-success">
                                <PiUserPlus size={20} />
                                <span className="font-semibold">{importResult.created.length} palestrantes criados e vinculados!</span>
                            </div>
                        )}

                        {importResult.linked?.length > 0 && (
                            <div className="alert alert-info">
                                <PiLink size={20} />
                                <span>{importResult.linked.length} palestrantes já existentes foram vinculados ao evento.</span>
                            </div>
                        )}

                        {importResult.errors?.length > 0 && (
                            <div className="alert alert-warning">
                                <PiWarning size={20} />
                                <div>
                                    <p className="font-semibold">{importResult.errors.length} erros:</p>
                                    <ul className="list-disc list-inside text-sm mt-1">
                                        {importResult.errors.slice(0, 5).map((err, i) => (
                                            <li key={i}>{err.nome} ({err.email}): {err.error}</li>
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
                                Formato: <strong>nome</strong> (obrigatório), <strong>email</strong> (obrigatório), <strong>instituicao</strong> (opcional)
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
                                    Preview ({parsedData.length} palestrantes)
                                </h4>
                                <div className="overflow-x-auto max-h-64">
                                    <table className="table table-sm table-zebra">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Nome</th>
                                                <th>Email</th>
                                                <th>Instituição</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.slice(0, 10).map((item, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td className="font-medium">{item.nome}</td>
                                                    <td>{item.email}</td>
                                                    <td>{item.instituicao || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {parsedData.length > 10 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            ...e mais {parsedData.length - 10} palestrantes
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
                                    Importar {parsedData.length} palestrantes
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
