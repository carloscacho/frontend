import Modal from '../../../_components/displays/Modal';

export default function ChangePasswordModal({ refModal, passwordForm, setPasswordForm, handleChangePassword, onClose }) {
    return (
        <Modal refModal={refModal}>
            <h3 className="font-bold text-lg mb-4">Alterar Senha</h3>
            <div className="space-y-4">
                <div>
                    <label className="label">
                        <span className="label-text">Senha Atual *</span>
                    </label>
                    <input
                        type="password"
                        className="input input-bordered w-full"
                        value={passwordForm.senhaAtual}
                        onChange={(e) => setPasswordForm({ ...passwordForm, senhaAtual: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text">Nova Senha *</span>
                    </label>
                    <input
                        type="password"
                        className="input input-bordered w-full"
                        value={passwordForm.novaSenha}
                        onChange={(e) => setPasswordForm({ ...passwordForm, novaSenha: e.target.value })}
                        required
                        minLength={6}
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text">Confirmar Nova Senha *</span>
                    </label>
                    <input
                        type="password"
                        className="input input-bordered w-full"
                        value={passwordForm.confirmarSenha}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmarSenha: e.target.value })}
                        required
                        minLength={6}
                    />
                </div>
            </div>

            <div className="modal-action">
                <button
                    type="button"
                    className="btn"
                    onClick={onClose}
                >
                    Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleChangePassword}>Alterar Senha</button>
            </div>
        </Modal>
    );
}
