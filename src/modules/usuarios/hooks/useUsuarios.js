import { useState, useEffect, useCallback } from "react";
import { formatCPF, filterItems } from "@/shared/utils/filter";
import { sortItems } from "@/shared/utils/sort";
import { useAlerta } from "@/shared/contexts/AlertContext";
import { useAuth } from "@/shared/contexts/AuthContext";
import { usuarioService } from "@/modules/usuarios/services/usuario.service";

export function useUsuarios() {
    const [usuarioList, setUsuarioList] = useState([]);
    const [usuarioF, setUsuariosF] = useState([]);
    const [novaUsuario, setNovaUsuario] = useState("");
    const [sortOrder, setSortOrder] = useState('id-desc');
    const [idToDelete, setIdToDelete] = useState(null);
    const [userToChangeRole, setUserToChangeRole] = useState(null);

    const { usuario } = useAuth();
    const isAdmin = usuario?.tipo === 1;
    const { mostrarAlerta } = useAlerta();

    const tipos = ["admin", "comum", "auxiliar", "responsável"];

    const getAllusuario = useCallback(async () => {
        try {
            const usuarioApi = await usuarioService.getAll();
            setUsuarioList(usuarioApi);
            setUsuariosF(usuarioApi);
        } catch (error) {
            console.error("Error fetching usuarios:", error);
        }
    }, []);

    useEffect(() => {
        getAllusuario();
    }, [getAllusuario]);

    const normalizarLista = useCallback((lista) => {
        return lista.map(item => ({
            id: item.id_usuario,
            nome: item.nome,
            description: `${item.email} - ${formatCPF(item.cpf || '')} - ${tipos[item.tipo - 1]}`,
            raw: item
        }));
    }, []); // tipos array is static within normalizer

    useEffect(() => {
        let results = filterItems(usuarioList, novaUsuario);
        let sorted = sortItems(results, sortOrder);
        setUsuariosF(sorted);
    }, [novaUsuario, sortOrder, usuarioList]);

    const confirmDelete = async (onClose) => {
        if (!idToDelete) return;
        try {
            await usuarioService.delete(idToDelete);
            mostrarAlerta("success", "Usuário deletado com sucesso!");
            await getAllusuario();
        } catch (error) {
            console.error("Error deleting usuario:", error);
            const msg = error.response?.data?.message || "Erro ao deletar usuário.";
            mostrarAlerta("error", msg);
        } finally {
            onClose();
            setIdToDelete(null);
        }
    };

    const handleRoleClick = (item, onOpenModal) => {
        if (!isAdmin) {
            mostrarAlerta("error", "Apenas administradores podem alterar cargos.");
            return;
        }
        const fullUser = usuarioList.find(u => u.id_usuario === item.id);
        setUserToChangeRole(fullUser);
        onOpenModal();
    };

    const saveRoleChange = async (id, newRole, onClose) => {
        try {
            await usuarioService.updateRole(id, newRole);
            mostrarAlerta("success", "Cargo atualizado com sucesso!");
            await getAllusuario();
            onClose();
            setUserToChangeRole(null);
        } catch (error) {
            console.error("Error updating role:", error);
            mostrarAlerta("error", "Erro ao atualizar cargo.");
        }
    };

    return {
        isAdmin,
        usuarioF,
        novaUsuario,
        setNovaUsuario,
        sortOrder,
        setSortOrder,
        normalizarLista,
        idToDelete,
        setIdToDelete,
        confirmDelete,
        userToChangeRole,
        setUserToChangeRole,
        handleRoleClick,
        saveRoleChange,
    };
}
