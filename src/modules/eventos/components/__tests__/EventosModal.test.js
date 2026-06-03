import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EventosModal from "../EventosModal";

// ── Mocks ───────────────────────────────────────────────────────────
const mockGetAllUsuarios = jest.fn();
jest.mock("@/modules/usuarios/services/usuario.service", () => ({
    usuarioService: {
        getAll: () => mockGetAllUsuarios()
    }
}));

const mockGetAllRecords = jest.fn();
jest.mock("@/shared/utils/crud", () => ({
    getAllRecords: (url) => mockGetAllRecords(url)
}));

jest.mock("@/shared/contexts/ModalContext", () => ({
    useModal: () => ({
        refMd: { current: null }
    })
}));

jest.mock("@/shared/components/utils/Input", () => ({ label, value, onChange, placeholder, type }) => (
    <div>
        <label htmlFor={label}>{label}</label>
        <input
            id={label}
            data-testid={`input-${label}`}
            value={value || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
            type={type || "text"}
            placeholder={placeholder}
        />
    </div>
));

jest.mock("@/shared/components/utils/InputColor", () => ({ label, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={label}>{label}</label>
        <input
            id={label}
            data-testid={`input-color-${label}`}
            value={value || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            type="text"
        />
    </div>
));

jest.mock("@/shared/components/utils/SingleSelect", () => ({ label, options, value, onChange, labelKey, valueKey }) => (
    <div>
        <label htmlFor={label}>{label}</label>
        <select
            id={label}
            data-testid={`select-${label}`}
            value={value ? value[valueKey] : ""}
            onChange={(e) => {
                const selected = options.find(opt => String(opt[valueKey]) === String(e.target.value));
                onChange(selected || null);
            }}
        >
            <option value="">Selecione...</option>
            {options.map(opt => (
                <option key={opt[valueKey]} value={opt[valueKey]}>
                    {opt[labelKey]}
                </option>
            ))}
        </select>
    </div>
));

jest.mock("@/shared/components/utils/Button", () => ({ label, onClick, color }) => (
    <button onClick={onClick} data-testid={`button-${label}`} className={color}>
        {label}
    </button>
));

describe("EventosModal Component", () => {
    const mockOnClickSalvar = jest.fn();
    const mockOnClickCancelar = jest.fn();
    const mockUsuarios = [
        { id_usuario: "1", nome: "Admin User" },
        { id_usuario: "2", nome: "Coordenador Geral" }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAllUsuarios.mockResolvedValue(mockUsuarios);
        mockGetAllRecords.mockResolvedValue([]);
    });

    test("deve renderizar campos com os valores iniciais padrão para criação", async () => {
        render(
            <EventosModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
            />
        );

        // Aguarda carregar as opções de usuários
        await waitFor(() => {
            expect(mockGetAllUsuarios).toHaveBeenCalled();
        });

        const inputNome = screen.getByTestId("input-Nome:");
        const inputSlug = screen.getByTestId("input-Slug:");
        const inputAno = screen.getByTestId("input-Ano:");
        const inputDataInicio = screen.getByTestId("input-Data Inicio:");
        const inputDataFim = screen.getByTestId("input-Data Final:");
        const selectResponsavel = screen.getByTestId("select-Responsável pelo Evento:");

        expect(inputNome.value).toBe("");
        expect(inputSlug.value).toBe("");
        expect(inputAno.value).toBe(new Date().getFullYear().toString());
        expect(inputDataInicio.value).toBe(new Date().toISOString().split("T")[0]);
        expect(inputDataFim.value).toBe(new Date().toISOString().split("T")[0]);
        expect(selectResponsavel.value).toBe("");
    });

    test("deve gerar o slug automaticamente ao digitar o nome (ignorando conectivos e números)", async () => {
        render(
            <EventosModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
            />
        );

        await waitFor(() => expect(mockGetAllUsuarios).toHaveBeenCalled());

        const inputNome = screen.getByTestId("input-Nome:");
        const inputSlug = screen.getByTestId("input-Slug:");
        const inputAno = screen.getByTestId("input-Ano:");

        // Força ano para 2026 para testar o slug gerado
        fireEvent.change(inputAno, { target: { value: "2026" } });
        // Nome com conectivos (de, da, e) e com número ("2026")
        fireEvent.change(inputNome, { target: { value: "Semana de Informática e Tecnologia 2026" } });

        // Acrônimo: Semana (s) + Informática (i) + Tecnologia (t). de, e, 2026 devem ser ignorados.
        // Ano: 2026
        // Esperado: sit2026
        expect(inputSlug.value).toBe("sit2026");
    });

    test("deve carregar dados para edição se initialData for provido", async () => {
        const initialData = {
            id_evento: 10,
            nome: "Evento Existente",
            ano: 2025,
            inicio: "2025-10-15T00:00:00.000Z",
            final: "2025-10-20T00:00:00.000Z",
            slug: "ev-existente",
            banner: "http://imagem.com/banner.jpg",
            cor_primaria: "#111111",
            cor_secundaria: "#222222",
            fk_usuario_responsavel: "2",
            usuario_responsavel: { id_usuario: "2", nome: "Coordenador Geral" }
        };

        render(
            <EventosModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
                initialData={initialData}
            />
        );

        await waitFor(() => expect(mockGetAllUsuarios).toHaveBeenCalled());

        expect(screen.getByTestId("input-Nome:").value).toBe("Evento Existente");
        expect(screen.getByTestId("input-Slug:").value).toBe("ev-existente");
        expect(screen.getByTestId("input-Ano:").value).toBe("2025");
        expect(screen.getByTestId("input-Data Inicio:").value).toBe("2025-10-15");
        expect(screen.getByTestId("input-Data Final:").value).toBe("2025-10-20");
        expect(screen.getByTestId("input-color-Cor Primária").value).toBe("#111111");
        expect(screen.getByTestId("input-color-Cor Secundária").value).toBe("#222222");
        expect(screen.getByTestId("select-Responsável pelo Evento:").value).toBe("2");
    });

    test("deve chamar onClickCancelar quando o botão cancelar for clicado", async () => {
        render(
            <EventosModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
            />
        );

        await waitFor(() => expect(mockGetAllUsuarios).toHaveBeenCalled());

        const btnCancelar = screen.getByTestId("button-cancelar");
        fireEvent.click(btnCancelar);

        expect(mockOnClickCancelar).toHaveBeenCalled();
    });

    test("deve submeter o formulário como FormData ao clicar em salvar", async () => {
        render(
            <EventosModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
            />
        );

        await waitFor(() => expect(mockGetAllUsuarios).toHaveBeenCalled());

        fireEvent.change(screen.getByTestId("input-Nome:"), { target: { value: "Workshop de React" } });
        fireEvent.change(screen.getByTestId("input-Ano:"), { target: { value: "2026" } });
        fireEvent.change(screen.getByTestId("input-Data Inicio:"), { target: { value: "2026-05-10" } });
        fireEvent.change(screen.getByTestId("input-Data Final:"), { target: { value: "2026-05-12" } });
        fireEvent.change(screen.getByTestId("input-color-Cor Primária"), { target: { value: "#333333" } });
        fireEvent.change(screen.getByTestId("input-color-Cor Secundária"), { target: { value: "#444444" } });
        fireEvent.change(screen.getByTestId("select-Responsável pelo Evento:"), { target: { value: "1" } });

        const btnSalvar = screen.getByTestId("button-Salvar");
        fireEvent.click(btnSalvar);

        expect(mockOnClickSalvar).toHaveBeenCalled();
        const sentFormData = mockOnClickSalvar.mock.calls[0][0];
        expect(sentFormData).toBeInstanceOf(FormData);
        expect(sentFormData.get("nome")).toBe("Workshop de React");
        expect(sentFormData.get("ano")).toBe("2026");
        expect(sentFormData.get("cor_primaria")).toBe("#333333");
        expect(sentFormData.get("cor_secundaria")).toBe("#444444");
        expect(sentFormData.get("fk_usuario_responsavel")).toBe("1");
    });
});
