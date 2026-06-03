import React, { useState, useEffect } from "react";
import Button from "@/shared/components/utils/Button";
import Select from "@/shared/components/utils/Select";

export default function RoleChangeModal({ user, onSave, onCancel }) {
    const [selectedRole, setSelectedRole] = useState(user?.tipo || 2);

    const roles = [
        { id: 1, nome: "Admin" },
        { id: 2, nome: "Comum" },
        { id: 3, nome: "Auxiliar" },
        { id: 4, nome: "Responsável" }
    ];

    useEffect(() => {
        if (user) {
            setSelectedRole(user.tipo);
        }
    }, [user]);

    return (
        <div className="w-full">
            <h3 className="font-bold text-lg mb-4">Alterar Cargo de {user?.nome}</h3>

            <Select
                label="Selecione o novo cargo"
                options={roles}
                selectValue={roles.find(r => r.id === selectedRole)}
                onChange={(option) => setSelectedRole(option.id)}
                valueKey="id"
                textKey="nome"
            />

            <div className="btns w-full flex justify-end mt-4 gap-2">
                <Button onClick={onCancel} label="Cancelar" color="neutral" mode="active" />
                <Button onClick={() => onSave(user.id_usuario, selectedRole)} label="Salvar" color="success" mode="active" />
            </div>
        </div>
    );
}
