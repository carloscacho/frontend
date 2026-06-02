import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "../page";

// ── Mocks ───────────────────────────────────────────────────────────
const mockUseAuth = jest.fn();
jest.mock("@/shared/contexts/AuthContext", () => ({
    useAuth: () => mockUseAuth()
}));

const mockUseEventos = jest.fn();
jest.mock("@/modules/eventos/hooks/useEventos", () => ({
    useEventos: () => mockUseEventos()
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

jest.mock("@/shared/components/displays/ListItens", () => ({ list, deleteFunction, editFunction, importFunction }) => (
    <div data-testid="items-list">
        {list.map(item => (
            <div key={item.id} data-testid={`item-${item.id}`}>
                <span>{item.nome}</span>
                {editFunction && <button onClick={() => editFunction(item)} data-testid={`edit-${item.id}`}>Editar</button>}
                {deleteFunction && <button onClick={() => deleteFunction(item.id)} data-testid={`delete-${item.id}`}>Excluir</button>}
                {importFunction && <button onClick={() => importFunction(item)} data-testid={`import-${item.id}`}>Importar</button>}
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

jest.mock("@/modules/eventos/components/CsvImportModal", () => ({ refModal, evento, onImport, onClose }) => {
    require('react').useEffect(() => {
        if (refModal) {
            refModal.current = {
                showModal: jest.fn(),
                close: jest.fn()
            };
        }
    }, [refModal]);
    return (
        <div data-testid="csv-import-modal">
            {evento && <span data-testid="csv-evento-name">{evento.nome}</span>}
            <button onClick={onClose} data-testid="csv-import-close">Fechar</button>
        </div>
    );
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

jest.mock("@/modules/eventos/components/EventosModal", () => ({ onClickSalvar, onClickCancelar, initialData }) => (
    <div data-testid="eventos-modal-inner">
        {initialData && <span data-testid="editing-indicator">{initialData.nome}</span>}
        <button onClick={() => onClickSalvar({ nome: "Novo Evento Mock" })} data-testid="modal-save-btn">Salvar</button>
        <button onClick={onClickCancelar} data-testid="modal-cancel-btn">Cancelar</button>
    </div>
));

describe("Eventos Admin Page", () => {
    const mockNormalizedList = [
        { id: 1, nome: "Evento Tecnologia", description: "2026 - 10/10/2026", raw: {} },
        { id: 2, nome: "Workshop Angular", description: "2026 - 12/12/2026", raw: {} }
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
        itemToDelete: null,
        isEditing: false,
        selectedEventForImport: null,
        setSelectedEventForImport: jest.fn(),
        importCsvAtividades: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ usuario: { tipo: 1 } }); // Admin por padrão
        mockUseEventos.mockReturnValue(defaultCrudOps);
    });

    test("deve renderizar título e componentes de busca e ordenação", () => {
        render(<Page />);
        expect(screen.getByTestId("hero-title")).toHaveTextContent("Cadastro de evento");
        expect(screen.getByTestId("search-input")).toBeInTheDocument();
        expect(screen.getByTestId("sort-control")).toBeInTheDocument();
    });

    test("deve renderizar botões de criar, editar, excluir e importar quando usuário é administrador", () => {
        render(<Page />);
        expect(screen.getByTestId("create-button")).toBeInTheDocument();
        expect(screen.getByTestId("edit-1")).toBeInTheDocument();
        expect(screen.getByTestId("delete-1")).toBeInTheDocument();
        expect(screen.getByTestId("import-1")).toBeInTheDocument();
    });

    test("não deve expor opções de escrita (criar, editar, excluir, importar) se usuário não for administrador", () => {
        mockUseAuth.mockReturnValue({ usuario: { tipo: 2 } }); // Não-admin (Usuário regular)
        render(<Page />);
        expect(screen.queryByTestId("create-button")).not.toBeInTheDocument();
        expect(screen.queryByTestId("edit-1")).not.toBeInTheDocument();
        expect(screen.queryByTestId("delete-1")).not.toBeInTheDocument();
        expect(screen.queryByTestId("import-1")).not.toBeInTheDocument();
    });

    test("deve atualizar o termo de pesquisa ao digitar na barra de busca", () => {
        render(<Page />);
        const input = screen.getByTestId("search-input");
        fireEvent.change(input, { target: { value: "Tecnologia" } });
        expect(defaultCrudOps.setSearchTerm).toHaveBeenCalledWith("Tecnologia");
    });

    test("deve chamar openCreate e abrir modal ao clicar em cadastrar", () => {
        render(<Page />);
        const btn = screen.getByTestId("create-button");
        fireEvent.click(btn);
        expect(defaultCrudOps.openCreate).toHaveBeenCalledWith(null);
    });

    test("deve chamar openEdit e abrir modal ao clicar em editar", () => {
        render(<Page />);
        const btn = screen.getByTestId("edit-1");
        fireEvent.click(btn);
        expect(defaultCrudOps.openEdit).toHaveBeenCalledWith(mockNormalizedList[0]);
    });

    test("deve chamar handleDelete ao clicar em excluir", () => {
        render(<Page />);
        const btn = screen.getByTestId("delete-2");
        fireEvent.click(btn);
        expect(defaultCrudOps.handleDelete).toHaveBeenCalledWith(2);
    });

    test("deve chamar confirmDelete ao confirmar diálogo de exclusão", async () => {
        render(<Page />);
        const btnDelete = screen.getByTestId("delete-2");
        fireEvent.click(btnDelete);
        
        const btnConfirm = screen.getByTestId("confirm-delete-btn");
        fireEvent.click(btnConfirm);

        expect(defaultCrudOps.confirmDelete).toHaveBeenCalled();
    });

    test("deve chamar cancelDelete ao cancelar diálogo de exclusão", () => {
        render(<Page />);
        const btnDelete = screen.getByTestId("delete-2");
        fireEvent.click(btnDelete);
        
        const btnCancel = screen.getByTestId("cancel-delete-btn");
        fireEvent.click(btnCancel);

        expect(defaultCrudOps.cancelDelete).toHaveBeenCalled();
    });

    test("deve abrir importação de CSV ao clicar em importar", () => {
        render(<Page />);
        const btnImport = screen.getByTestId("import-1");
        fireEvent.click(btnImport);
        expect(defaultCrudOps.setSelectedEventForImport).toHaveBeenCalledWith(mockNormalizedList[0]);
    });

    test("deve chamar handleSave ao salvar o formulário do modal e fechar o modal", async () => {
        defaultCrudOps.handleSave.mockResolvedValue(true);
        render(<Page />);
        const btnEdit = screen.getByTestId("edit-1");
        fireEvent.click(btnEdit);

        const btnSave = screen.getByTestId("modal-save-btn");
        fireEvent.click(btnSave);

        expect(defaultCrudOps.handleSave).toHaveBeenCalledWith({ nome: "Novo Evento Mock" });
    });
});
