import QRCode from 'react-qr-code';
import { printUserProfile } from '@/utils/printUtils';

export default function UserProfile({ usuario, participanteId, onUpdateClick, onPasswordClick, onLogout }) {
    const handlePrint = () => {
        printUserProfile({ usuario, participanteId });
    };

    return (
        <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* QR Code Section */}
                    <div className="flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold mb-4">Participante</h2>
                        {participanteId && (
                            <div className="bg-white p-6 rounded-lg qr-print-source">
                                <QRCode title={participanteId.toString()} value={participanteId.toString()} size={200} />
                            </div>
                        )}
                        <button
                            onClick={handlePrint}
                            className="btn btn-info mt-4"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir
                        </button>
                    </div>

                    {/* Information Section */}
                    <div className="space-y-4">
                        <div>
                            <label className="font-bold text-lg">Nome:</label>
                            <p className="text-xl">{usuario.nome}</p>
                        </div>

                        <div>
                            <label className="font-bold text-lg">E-mail:</label>
                            <p className="text-xl">{usuario.email}</p>
                        </div>

                        <div>
                            <label className="font-bold text-lg">CPF:</label>
                            <p className="text-xl">{usuario.cpf}</p>
                        </div>

                        {usuario.instituicao && (
                            <div>
                                <label className="font-bold text-lg">Instituição:</label>
                                <p className="text-xl">{usuario.instituicao}</p>
                            </div>
                        )}

                        {usuario.comunidade && (
                            <div>
                                <label className="font-bold text-lg">Comunidade:</label>
                                <p className="text-xl">{usuario.comunidade}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="divider"></div>
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                    <button
                        onClick={onUpdateClick}
                        className="btn btn-warning"
                    >
                        Atualizar informações
                    </button>
                    <button
                        onClick={onPasswordClick}
                        className="btn btn-secondary"
                    >
                        Alterar Senha
                    </button>
                    <button
                        onClick={onLogout}
                        className="btn btn-error"
                    >
                        Sair
                    </button>
                </div>

                {/* Important Notice */}
                <div className="alert alert-info mt-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>
                        <strong>IMPORTANTE:</strong> o nome deve ser completo e sem abreviações, confira se as informações estão corretas até o fim do evento, pois serão usados para gerar os certificados e eles não serão refeitos.
                    </span>
                </div>
            </div>
        </div>
    );
}
