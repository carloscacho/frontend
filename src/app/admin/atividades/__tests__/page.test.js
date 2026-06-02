import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "../page";

// ── Mocks ───────────────────────────────────────────────────────────
const mockUseAuth = jest.fn();
jest.mock("@/shared/contexts/AuthContext", () => ({
    useAuth: () => mockUseAuth()
}));

const mockUseAtividades = jest.fn();
jest.mock("@/modules/atividades/hooks/useAtividades", () => ({
    useAtividades: () => mockUseAtividades()
}));

jest.mock("@/shared/components/displays/PageContainer", () => ({ children }) => <div data-testid="page-container">{children}</div>);
jest.mock("@/shared/components/displays/Hero", () => ({ title }) => <h1 data-testid="hero-title">{title}</h1>);
jest.mock("@/shared/components/utils/SortControl", () => ({ value, onChange }) => (
    <select data-testid="sort-control" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="id-desc">ID Desc</option>
        <option value="nome-asc">Nome Asc</option>
    </select>
));

jest.mock("@/shared/components/utils/TextInputWithButton", () => ({ placeholder, value, onChange, onClick, hideButton, children }) => (
    <div data-testid="search-bar">
        <input 
            data-testid="search-input"
            placeholder={placeholder} 
            value={value} 
            onChange={(e) => onChange && onChange(e.target.value)} 
        />
        {!hideButton && <button onClick={onClick} data-testid="create-button">Cadastrar</button>}
        {children}
    </div>
));

jest.mock("@/shared/components/displays/ListItens", () => ({ list, deleteFunction, editFunction }) => (
    <div data-testid="items-list">
        {list.map(item => (
            <div key={item.id} data-testid={`item-${item.id}`}>
                <span>{item.nome}</span>
                {editFunction && <button onClick={() => editFunction(item)} data-testid={`edit-${item.id}`}>Editar</button>}
                {deleteFunction && <button onClick={() => deleteFunction(item.id)} data-testid={`delete-${item.id}`}>Excluir</button>}
            </div>
        ))}
    </div>
));

jest.mock("@/shared/components/displays/Modal", () => ({ children, refModal }) => {
    require('react').useEffect(() => {
        if (refModal) {
            refModal.current = {
                showModal: jest.fn(),
                close: jest.fn()
            };
        }
    }, [refModal]);
    return <div data-testid="modal-container">{children}</div>;
});

jest.mock("@/shared/components/displays/ConfirmDialog", () => ({ refModal, title, message, onConfirm, onCancel }) => {
    require('react').useEffect(() => {
        if (refModal) {
            refModal.current = {
                showModal: jest.fn(),
                close: jest.fn()
            };
        }
    }, [refModal]);
    return (
        <div data-testid="confirm-dialog">
            <h3>{title}</h3>
            <button onClick={onConfirm} data-testid="confirm-delete-btn">Confirmar Exclusão</button>
            <button onClick={onCancel} data-testid="cancel-delete-btn">Cancelar Exclusão</button>
        </div>
    );
});

jest.mock("@/modules/atividades/components/AtividadesModal", () => ({ onClickSalvar, onClickCancelar, initialData }) => (
    <div data-testid="atividades-modal-inner">
        {initialData && <span data-testid="editing-indicator">{initialData.nome}</span>}
        <button onClick={() => onClickSalvar({ nome: "Nova Atividade Mock" })} data-testid="modal-save-btn">Salvar</button>
        <button onClick={onClickCancelar} data-testid="modal-cancel-btn">Cancelar</button>
    </div>
));

describe("Atividades Admin Page", () => {
    const mockNormalizedList = [
        { id: 101, nome: "Introdução a Python", description: "Python Básico - Local: Auditório", raw: {} },
        { id: 102, nome: "Arquitetura Hexagonal", description: "Conceitos de Design - Local: Lab 2", raw: {} }
    ];

    const defaultCrudOps = {
        normalizedList: mockNormalizedList,
        searchTerm: "",
        setSearchTerm: jest.fn(),
        sortOrder: "id-desc",
        setSortOrder: jest.fn(),
        handleSave: jest.fn(),
        handleDelete: jest.fn(),
        confirmDelete: jest.fn(),
        cancelDelete: jest.fn(),
        editingItem: null,
        openEdit: jest.fn(),
        openCreate: jest.fn(),
        closeEdit: jest.fn(),
        isEditing: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ usuario: { tipo: 1 } }); // Admin por padrão
        mockUseAtividades.mockReturnValue(defaultCrudOps);
    });

    test("deve renderizar título e componentes de busca/ordenação", () => {
        render(<Page />);
        expect(screen.getByTestId("hero-title")).toHaveTextContent("Cadastro de atividade");
        expect(screen.getByTestId("search-input")).toBeInTheDocument();
        expect(screen.getByTestId("sort-control")).toBeInTheDocument();
    });

    test("deve renderizar botões de criar, editar e excluir para administrador", () => {
        render(<Page />);
        expect(screen.getByTestId("create-button")).toBeInTheDocument();
        expect(screen.getByTestId("edit-101")).toBeInTheDocument();
        expect(screen.getByTestId("delete-101")).toBeInTheDocument();
    });

    test("não deve mostrar botões de edição ou exclusão se usuário não for administrador", () => {
        mockUseAuth.mockReturnValue({ usuario: { tipo: 2 } });
        render(<Page />);
        expect(screen.queryByTestId("create-button")).not.toBeInTheDocument();
        expect(screen.queryByTestId("edit-101")).not.toBeInTheDocument();
        expect(screen.queryByTestId("delete-101")).not.toBeInTheDocument();
    });

    test("deve chamar setSearchTerm ao alterar termo na busca", () => {
        render(<Page />);
        fireEvent.change(screen.getByTestId("search-input"), { target: { value: "Python" } });
        expect(defaultCrudOps.setSearchTerm).toHaveBeenCalledWith("Python");
    });

    test("deve abrir modal de criação ao clicar em cadastrar", () => {
        render(<Page />);
        fireEvent.click(screen.getByTestId("create-button"));
        expect(defaultCrudOps.openCreate).toHaveBeenCalledWith(null);
    });

    test("deve abrir modal de edição ao clicar em editar", () => {
        render(<Page />);
        fireEvent.click(screen.getByTestId("edit-101"));
        expect(defaultCrudOps.openEdit).toHaveBeenCalledWith(mockNormalizedList[0]);
    });

    test("deve abrir diálogo de confirmação de exclusão ao clicar em excluir", () => {
        render(<Page />);
        fireEvent.click(screen.getByTestId("delete-102"));
        expect(defaultCrudOps.handleDelete).toHaveBeenCalledWith(102);
    });

    test("deve chamar confirmDelete ao confirmar exclusão no diálogo", () => {
        render(<Page />);
        fireEvent.click(screen.getByTestId("delete-102"));
        fireEvent.click(screen.getByTestId("confirm-delete-btn"));
        expect(defaultCrudOps.confirmDelete).toHaveBeenCalled();
    });

    test("deve chamar cancelDelete ao cancelar exclusão no diálogo", () => {
        render(<Page />);
        fireEvent.click(screen.getByTestId("delete-102"));
        fireEvent.click(screen.getByTestId("cancel-delete-btn"));
        expect(defaultCrudOps.cancelDelete).toHaveBeenCalled();
    });

    test("deve chamar handleSave ao salvar o formulário do modal", async () => {
        defaultCrudOps.handleSave.mockResolvedValue(true);
        render(<Page />);
        fireEvent.click(screen.getByTestId("edit-101"));

        fireEvent.click(screen.getByTestId("modal-save-btn"));

        expect(defaultCrudOps.handleSave).toHaveBeenCalledWith({ nome: "Nova Atividade Mock" });
    });
});
