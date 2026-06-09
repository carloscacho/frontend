import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AtividadesModal from "../AtividadesModal";

// ── Mocks ───────────────────────────────────────────────────────────
const mockGetSalas = jest.fn();
jest.mock("@/modules/salas/services/sala.service", () => ({
    salaService: {
        getAll: () => mockGetSalas()
    }
}));

const mockGetPalestrantes = jest.fn();
jest.mock("@/modules/palestrantes/services/palestrante.service", () => ({
    palestranteService: {
        getAll: () => mockGetPalestrantes()
    }
}));

const mockGetAtividades = jest.fn();
jest.mock("@/modules/atividades/services/atividade.service", () => ({
    atividadeService: {
        getAll: () => mockGetAtividades()
    }
}));

const mockEventoSelect = { id_evento: 5 };
jest.mock("@/shared/contexts/EventFilterContext", () => ({
    useEventFilter: () => ({
        eventoSelect: mockEventoSelect
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

jest.mock("@/shared/components/utils/MultiSelect", () => ({ label, options, selectedValues, onChange, valueKey, labelKey }) => (
    <div>
        <label htmlFor={label}>{label}</label>
        <select
            id={label}
            multiple
            data-testid={`multiselect-${label}`}
            value={selectedValues || []}
            onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                onChange(values);
            }}
        >
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

describe("AtividadesModal Component", () => {
    const mockOnClickSalvar = jest.fn();
    const mockOnClickCancelar = jest.fn();

    const salasMock = [
        { id_sala: 1, nome: "Laboratório 1" },
        { id_sala: 2, nome: "Auditório Principal" }
    ];

    const palestrantesMock = [
        { id_palestrante: "p1", nome: "Dra. Ana Silva" },
        { id_palestrante: "p2", nome: "Dr. João Sousa" }
    ];

    const atividadesMock = [
        { id_atividade: 101, nome: "Palestra de Abertura", fk_evento: 5 },
        { id_atividade: 102, nome: "Outro Evento Atividade", fk_evento: 9 } // outro evento
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSalas.mockResolvedValue(salasMock);
        mockGetPalestrantes.mockResolvedValue(palestrantesMock);
        mockGetAtividades.mockResolvedValue(atividadesMock);
    });

    test("deve carregar opções de salas, palestrantes e atividades no mount", async () => {
        render(
            <AtividadesModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
            />
        );

        await waitFor(() => {
            expect(mockGetSalas).toHaveBeenCalled();
            expect(mockGetPalestrantes).toHaveBeenCalled();
            expect(mockGetAtividades).toHaveBeenCalled();
        });

        // O Select de Atividade Vinculada deve filtrar apenas atividades do evento selecionado (fk_evento = 5)
        const selectVinculo = screen.getByTestId("select-Atividade Vinculada (Opcional)");
        expect(selectVinculo).toBeInTheDocument();
        const options = selectVinculo.querySelectorAll("option");
        // Opção vazia + Palestra de Abertura (fk_evento = 5)
        expect(options.length).toBe(2); 
    });

    test("deve renderizar campos vazios em modo de criação", async () => {
        render(
            <AtividadesModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
            />
        );

        await waitFor(() => expect(mockGetSalas).toHaveBeenCalled());

        expect(screen.getByTestId("input-Nome:")).toHaveValue("");
        expect(screen.getByTestId("input-Tipo:")).toHaveValue("");
        expect(screen.getByTestId("input-Descrição:")).toHaveValue("");
        expect(screen.getByTestId("input-Observação:")).toHaveValue("");
        expect(screen.getByTestId("input-Limite:")).toHaveValue(null);
        expect(screen.getByTestId("select-Local")).toHaveValue("");
        expect(screen.getByTestId("multiselect-Palestrantes")).toHaveValue([]);
        expect(screen.getByTestId("input-Data:")).toHaveValue("");
        expect(screen.getByTestId("input-Hora Início:")).toHaveValue("");
        expect(screen.getByTestId("input-Duração:")).toHaveValue("");
        expect(screen.getByTestId("select-Atividade Vinculada (Opcional)")).toHaveValue("");
    });

    test("deve carregar dados iniciais no formulário em modo de edição", async () => {
        const initialData = {
            id_atividade: 101,
            nome: "Workshop Git",
            tipo: "Oficina",
            descricao: "Aprenda Git na prática",
            observacao: "Levar notebook",
            limite: 30,
            sala: { id_sala: 1, nome: "Laboratório 1" },
            fk_sala: 1,
            fk_atividade_vinculada: null,
            palestrante_atividade: [
                { fk_palestrante: "p1" }
            ],
            data_atividade: [
                {
                    data: "2026-06-15T00:00:00.000Z",
                    hora: "2026-06-15T14:30:00.000Z",
                    duracao: "2026-06-15T02:00:00.000Z"
                }
            ]
        };

        render(
            <AtividadesModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
                initialData={initialData}
            />
        );

        await waitFor(() => expect(mockGetSalas).toHaveBeenCalled());

        expect(screen.getByTestId("input-Nome:")).toHaveValue("Workshop Git");
        expect(screen.getByTestId("input-Tipo:")).toHaveValue("Oficina");
        expect(screen.getByTestId("input-Descrição:")).toHaveValue("Aprenda Git na prática");
        expect(screen.getByTestId("input-Observação:")).toHaveValue("Levar notebook");
        expect(screen.getByTestId("input-Limite:")).toHaveValue(30);
        expect(screen.getByTestId("select-Local")).toHaveValue("1");
        expect(screen.getByTestId("multiselect-Palestrantes")).toHaveValue(["p1"]);
        expect(screen.getByTestId("input-Data:")).toHaveValue("2026-06-15");
        expect(screen.getByTestId("input-Hora Início:")).toHaveValue("14:30");
        expect(screen.getByTestId("input-Duração:")).toHaveValue("02:00");
    });

    test("deve chamar onClickCancelar ao cancelar", async () => {
        render(
            <AtividadesModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
            />
        );

        await waitFor(() => expect(mockGetSalas).toHaveBeenCalled());

        fireEvent.click(screen.getByTestId("button-Cancelar"));
        expect(mockOnClickCancelar).toHaveBeenCalled();
    });

    test("deve enviar o payload correto ao salvar", async () => {
        render(
            <AtividadesModal
                onClickSalvar={mockOnClickSalvar}
                onClickCancelar={mockOnClickCancelar}
            />
        );

        await waitFor(() => expect(mockGetSalas).toHaveBeenCalled());

        fireEvent.change(screen.getByTestId("input-Nome:"), { target: { value: "Minicurso Docker" } });
        fireEvent.change(screen.getByTestId("input-Tipo:"), { target: { value: "Minicurso" } });
        fireEvent.change(screen.getByTestId("input-Descrição:"), { target: { value: "Docker Básico" } });
        fireEvent.change(screen.getByTestId("input-Limite:"), { target: { value: "45" } });
        fireEvent.change(screen.getByTestId("select-Local"), { target: { value: "2" } }); // Auditório Principal (id: 2)
        
        // Mocking multi-select change event to select 'p1' and 'p2'
        const selectPalestrantes = screen.getByTestId("multiselect-Palestrantes");
        // Simulate selecting multiple option values
        const options = selectPalestrantes.querySelectorAll("option");
        options[0].selected = true; // p1
        options[1].selected = true; // p2
        fireEvent.change(selectPalestrantes);

        fireEvent.change(screen.getByTestId("input-Data:"), { target: { value: "2026-06-16" } });
        fireEvent.change(screen.getByTestId("input-Hora Início:"), { target: { value: "09:00" } });
        fireEvent.change(screen.getByTestId("input-Duração:"), { target: { value: "03:00" } });

        fireEvent.click(screen.getByTestId("button-Salvar"));

        expect(mockOnClickSalvar).toHaveBeenCalledWith({
            nome: "Minicurso Docker",
            tipo: "Minicurso",
            descricao: "Docker Básico",
            observacao: "",
            limite: 45,
            fk_sala: 2,
            fk_evento: 5,
            fk_atividade_vinculada: null,
            palestrantes: ["p1", "p2"],
            data_atividade: {
                data: "2026-06-16",
                hora: "09:00",
                duracao: "03:00"
            }
        });
    });
});
