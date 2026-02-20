'use client';
import { useState, useRef } from 'react';
import { PiUploadSimple, PiX, PiCheck, PiWarning, PiSpinner, PiUserPlus } from 'react-icons/pi';
import Cookies from 'js-cookie';

/**
 * Modal for enrolling participants in an activity by email (single or CSV batch).
 * @param {Object} props
 * @param {React.RefObject} props.refModal - Reference to the dialog element
 * @param {number} props.activityId - The activity ID
 * @param {Function} props.onSuccess - Callback after successful enrollment
 */
export default function InscricaoParticipanteModal({ refModal, activityId, onSuccess }) {
    const [activeTab, setActiveTab] = useState('single'); // 'single' | 'csv'
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null);
    const [parsedEmails, setParsedEmails] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const resetState = () => {
        setEmail('');
        setFile(null);
        setParsedEmails([]);
        setErrors([]);
        setIsLoading(false);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        resetState();
        refModal?.current?.close();
    };

    const getToken = () => {
        const userCookies = Cookies.get('usuarioData');
        if (!userCookies) return null;
        const { token } = JSON.parse(userCookies);
        return token;
    };

    const submitEmails = async (emails) => {
        const token = getToken();
        if (!token) {
            setErrors(['Usuário não autenticado']);
            return;
        }

        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
            const res = await fetch(`${apiUrl}/atividade/${activityId}/inscrever-participantes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ emails }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                onSuccess?.();
            } else {
                const errData = await res.json().catch(() => ({}));
                setErrors([errData.message || 'Erro ao inscrever participantes']);
            }
        } catch (error) {
            setErrors([error.message || 'Erro de conexão']);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSingleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setErrors([]);
        setResult(null);
        submitEmails([email.trim()]);
    };

    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        if (lines.length < 1) return { emails: [], errors: ['Arquivo CSV vazio'] };

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const emailIdx = headers.indexOf('email');

        const emails = [];
        const parseErrors = [];

        // If there's a header row with 'email', skip it
        const startLine = emailIdx >= 0 ? 1 : 0;
        const colIdx = emailIdx >= 0 ? emailIdx : 0;

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            const val = values[colIdx];

            if (val && val.includes('@')) {
                emails.push(val.toLowerCase());
            } else if (val) {
                parseErrors.push(`Linha ${i + 1}: "${val}" não parece ser um email válido`);
            }
        }

        return { emails: [...new Set(emails)], errors: parseErrors };
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.txt')) {
            setErrors(['Por favor, selecione um arquivo CSV ou TXT']);
            return;
        }

        setFile(selectedFile);
        setErrors([]);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text === 'string') {
                const { emails, errors: parseErrors } = parseCSV(text);
                setParsedEmails(emails);
                setErrors(parseErrors);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleCsvSubmit = () => {
        if (parsedEmails.length === 0) return;
        setResult(null);
        submitEmails(parsedEmails);
    };

    return (
        <dialog ref={refModal} className="modal">
            <div className="modal-box max-w-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Inscrever Participante</h3>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={handleClose}
                    >
                        <PiX size={20} />
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <div className="mb-6 space-y-3">
                        {result.success?.length > 0 && (
                            <div className="alert alert-success">
                                <PiCheck size={20} />
                                <div>
                                    <p className="font-semibold">{result.success.length} participante(s) inscrito(s)!</p>
                                    <ul className="list-disc list-inside text-sm mt-1">
                                        {result.success.map((s, i) => (
                                            <li key={i}>{s.nome} ({s.email})</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {result.errors?.length > 0 && (
                            <div className="alert alert-warning">
                                <PiWarning size={20} />
                                <div>
                                    <p className="font-semibold">{result.errors.length} erro(s):</p>
                                    <ul className="list-disc list-inside text-sm mt-1">
                                        {result.errors.slice(0, 10).map((e, i) => (
                                            <li key={i}>{e.email}: {e.error}</li>
                                        ))}
                                        {result.errors.length > 10 && (
                                            <li>...e mais {result.errors.length - 10} erros</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => { resetState(); }}>
                            Nova inscrição
                        </button>
                    </div>
                )}

                {/* Tabs */}
                {!result && (
                    <>
                        <div role="tablist" className="tabs tabs-lift tabs-lg mb-6">
                            <button
                                role="tab"
                                className={`tab ${activeTab === 'single' ? 'tab-active' : ''}`}
                                onClick={() => { setActiveTab('single'); setErrors([]); }}
                            >
                                Email único
                            </button>
                            <button
                                role="tab"
                                className={`tab ${activeTab === 'csv' ? 'tab-active' : ''}`}
                                onClick={() => { setActiveTab('csv'); setErrors([]); }}
                            >
                                Importar CSV
                            </button>
                        </div>

                        {/* Single email tab */}
                        {activeTab === 'single' && (
                            <form onSubmit={handleSingleSubmit}>
                                <label className="label">
                                    <span className="label-text">Email do participante</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="participante@email.com"
                                        className="input input-bordered flex-1"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isLoading || !email.trim()}
                                    >
                                        {isLoading ? (
                                            <PiSpinner className="animate-spin" size={20} />
                                        ) : (
                                            <PiUserPlus size={20} />
                                        )}
                                        Inscrever
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* CSV tab */}
                        {activeTab === 'csv' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Selecione o arquivo CSV com emails
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileChange}
                                    className="file-input file-input-bordered w-full"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Formato: uma coluna &quot;email&quot; com os emails dos participantes, um por linha.
                                </p>

                                {/* Preview */}
                                {parsedEmails.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">
                                            {parsedEmails.length} email(s) encontrado(s)
                                        </h4>
                                        <div className="max-h-40 overflow-y-auto bg-base-200 rounded-lg p-3">
                                            {parsedEmails.slice(0, 20).map((em, i) => (
                                                <div key={i} className="text-sm py-0.5">{em}</div>
                                            ))}
                                            {parsedEmails.length > 20 && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    ...e mais {parsedEmails.length - 20} emails
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Errors */}
                        {errors.length > 0 && (
                            <div className="alert alert-error mt-4">
                                <PiWarning size={20} />
                                <ul className="list-disc list-inside">
                                    {errors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {/* Actions */}
                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={handleClose}>
                        {result ? 'Fechar' : 'Cancelar'}
                    </button>
                    {!result && activeTab === 'csv' && parsedEmails.length > 0 && (
                        <button
                            className="btn btn-primary"
                            onClick={handleCsvSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <PiSpinner className="animate-spin" size={20} />
                                    Inscrevendo...
                                </>
                            ) : (
                                <>
                                    <PiUploadSimple size={20} />
                                    Inscrever {parsedEmails.length} participante(s)
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
