import Modal from '@/shared/components/displays/Modal';

export default function UpdateInfoModal({ refModal, updateForm, setUpdateForm, handleUpdateInfo }) {
    return (
        <Modal refModal={refModal}>
            <h3 className="font-bold text-lg mb-4">Atualizar Informações</h3>
            <div className="space-y-4">
                <div>
                    <label className="label">
                        <span className="label-text">Nome Completo *</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={updateForm.nome}
                        onChange={(e) => setUpdateForm({ ...updateForm, nome: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text">E-mail *</span>
                    </label>
                    <input
                        type="email"
                        className="input input-bordered w-full"
                        value={updateForm.email}
                        onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text">Instituição</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={updateForm.instituicao}
                        onChange={(e) => setUpdateForm({ ...updateForm, instituicao: e.target.value })}
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text">Comunidade</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={updateForm.comunidade}
                        onChange={(e) => setUpdateForm({ ...updateForm, comunidade: e.target.value })}
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text">RA</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={updateForm.ra}
                        onChange={(e) => setUpdateForm({ ...updateForm, ra: e.target.value })}
                    />
                </div>
            </div>

            <div className="modal-action">
                <button type="button" className="btn" onClick={() => refModal.current?.close()}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateInfo}>Salvar</button>
            </div>
        </Modal>
    );
}
