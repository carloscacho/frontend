import Modal from '@/shared/components/displays/Modal';

export default function UpdateInfoModal({ refModal, evento }) {
    const nomeResponsavel = evento?.usuario_responsavel?.nome || 'Administrador do Evento';
    const emailResponsavel = evento?.usuario_responsavel?.email;

    return (
        <Modal refModal={refModal}>
            <h3 className="font-bold text-lg mb-4 text-primary">Atualizar Informações</h3>

            <div className="py-4 space-y-4 text-base-content/80">
                <p>
                    Para atualizar suas informações pessoais, por favor entre em contato com a organização.
                </p>

                <div className="bg-base-200 p-4 rounded-lg border border-base-300">
                    <h4 className="font-semibold text-base-content mb-2">Responsável pelo evento:</h4>
                    <p className="font-medium">{nomeResponsavel}</p>
                    {emailResponsavel && (
                        <p className="text-sm mt-1">
                            Email: <a href={`mailto:${emailResponsavel}`} className="link link-primary">{emailResponsavel}</a>
                        </p>
                    )}
                </div>

                <div className="divider">OU</div>

                <div className="bg-base-200 p-4 rounded-lg border border-base-300">
                    <h4 className="font-semibold text-base-content mb-2">Desenvolvedor do sistema:</h4>
                    <p className="font-medium">Carlos Emilio de Andrade Cacho</p>
                    <p className="text-sm">Email: <a href="mailto:carlos.cacho@ifms.edu.br" className="link link-primary">carlos.cacho@ifms.edu.br</a></p>
                </div>
            </div>

            <div className="modal-action">
                <button type="button" className="btn btn-primary" onClick={() => refModal.current?.close()}>Entendi</button>
            </div>
        </Modal>
    );
}
