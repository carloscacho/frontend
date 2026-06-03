import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RelatorioDetalhado from '../../../../app/admin/relatorios/[id]/page';

// ── Mocks ───────────────────────────────────────────────────────────
const mockMostrarAlerta = jest.fn();
const mockPush = jest.fn();
const mockGetReport = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/shared/contexts/AlertContext', () => ({
  useAlerta: () => ({
    mostrarAlerta: mockMostrarAlerta,
  }),
}));

jest.mock('@/modules/eventos/services/evento.service', () => ({
  eventoService: {
    getReport: (...args) => mockGetReport(...args),
  },
}));

jest.mock('@/shared/components/displays/LoadingSpinner', () => () => <div data-testid="spinner">Loading...</div>);

// Mock button
jest.mock('@/shared/components/utils/Button', () => ({ children, onClick, ...props }) => (
  <button onClick={onClick} {...props}>{children}</button>
));

// Mock print
const originalPrint = window.print;
beforeAll(() => {
  window.print = jest.fn();
});
afterAll(() => {
  window.print = originalPrint;
});

// ── Test Data ───────────────────────────────────────────────────────
const mockReportData = {
  evento: {
    id_evento: 1,
    nome: 'Semana Tecnológica 2026',
    inicio: '2026-06-01T00:00:00.000Z',
    final: '2026-06-03T00:00:00.000Z',
    responsavel: 'Coordenador TI',
    totalInscritos: 150,
    ano: 2026,
  },
  atividades: [
    {
      id_atividade: 10,
      nome: 'Palestra de IA',
      sala: 'Auditório Principal',
      limite: 100,
      totalInscritos: 2,
      totalPresentes: 1,
      participantes: [
        {
          fk_participante: 101,
          nome: 'Aluno Um',
          email: 'aluno1@ifms.edu.br',
          vinculo: 1, // Aluno
          turmas: ['TADS'],
          semestre: 1, // 2026-1
          presenca: 1,
        },
        {
          fk_participante: 102,
          nome: 'Prof Dois',
          email: 'prof2@ifms.edu.br',
          vinculo: 2, // Professor
          turmas: ['TADS', 'Técnico'],
          semestre: null,
          presenca: 0,
        },
      ],
    },
    {
      id_atividade: 11,
      nome: 'Minicurso Git',
      sala: 'Lab 3',
      limite: 30,
      totalInscritos: 1,
      totalPresentes: 1,
      participantes: [
        {
          fk_participante: 103,
          nome: 'Externo Três',
          email: 'externo3@gmail.com',
          vinculo: 3, // Comunidade
          turmas: [],
          semestre: null,
          presenca: 1,
        },
      ],
    },
  ],
};

// ── Tests ───────────────────────────────────────────────────────────
describe('RelatorioDetalhado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exibe spinner de carregamento inicialmente', () => {
    mockGetReport.mockReturnValue(new Promise(() => {}));
    render(<RelatorioDetalhado />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('renderiza dados do relatório e cabeçalho corretamente', async () => {
    mockGetReport.mockResolvedValue(mockReportData);
    render(<RelatorioDetalhado />);

    await waitFor(() => {
      expect(screen.getByText('Semana Tecnológica 2026')).toBeInTheDocument();
      expect(screen.getByText('Coordenador TI')).toBeInTheDocument();
    });

    // KPI verification
    expect(screen.getByTestId('kpi-evento-inscritos')).toHaveTextContent('150');
    expect(screen.getByTestId('kpi-inscricoes-ativ')).toHaveTextContent('3');
    expect(screen.getByTestId('kpi-presencas-confirmadas')).toHaveTextContent('2');

    // Table rows
    expect(screen.getByTestId('nome-10')).toHaveTextContent('Palestra de IA');
    expect(screen.getByText('Auditório Principal')).toBeInTheDocument();
    expect(screen.getByTestId('nome-11')).toHaveTextContent('Minicurso Git');
  });

  test('filtra os dados por Curso/Turma dinamicamente', async () => {
    mockGetReport.mockResolvedValue(mockReportData);
    render(<RelatorioDetalhado />);

    await waitFor(() => {
      expect(screen.getByTestId('nome-10')).toBeInTheDocument();
    });

    // Select "TADS" in Turma dropdown
    fireEvent.change(screen.getByTestId('select-turma'), {
      target: { value: 'TADS' },
    });

    // Under TADS filter: Palestra de IA has 2 participants (Aluno1: TADS, Prof2: TADS,Técnico), Minicurso Git has 0 participants (Externo: [])
    // So Minicurso should now show 0/0
    await waitFor(() => {
      expect(screen.getByTestId('inscritos-11')).toHaveTextContent('0');
      expect(screen.getByTestId('presentes-11')).toHaveTextContent('0');
      expect(screen.getByTestId('inscritos-10')).toHaveTextContent('2');
      expect(screen.getByTestId('presentes-10')).toHaveTextContent('1');
    });
  });

  test('filtra os dados por Vínculo (Aluno)', async () => {
    mockGetReport.mockResolvedValue(mockReportData);
    render(<RelatorioDetalhado />);

    await waitFor(() => {
      expect(screen.getByTestId('nome-10')).toBeInTheDocument();
    });

    // Select Aluno (value "1") in Vínculo dropdown
    fireEvent.change(screen.getByTestId('select-vinculo'), { target: { value: '1' } });

    await waitFor(() => {
      // Palestra has 1 Aluno (present), Minicurso has 0 Alunos
      expect(screen.getByTestId('inscritos-10')).toHaveTextContent('1');
      expect(screen.getByTestId('presentes-10')).toHaveTextContent('1');
      expect(screen.getByTestId('inscritos-11')).toHaveTextContent('0');
      expect(screen.getByTestId('presentes-11')).toHaveTextContent('0');
    });
  });

  test('dispara window.print ao clicar em Exportar PDF', async () => {
    mockGetReport.mockResolvedValue(mockReportData);
    render(<RelatorioDetalhado />);

    await waitFor(() => {
      expect(screen.getByText('Exportar PDF')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Exportar PDF'));
    expect(window.print).toHaveBeenCalled();
  });

  test('copia dados da tabela para área de transferência', async () => {
    mockGetReport.mockResolvedValue(mockReportData);
    render(<RelatorioDetalhado />);

    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    global.navigator.clipboard = mockClipboard;

    await waitFor(() => {
      expect(screen.getByText('Copiar Tabela')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Copiar Tabela'));
    expect(mockClipboard.writeText).toHaveBeenCalled();
    expect(mockMostrarAlerta).toHaveBeenCalledWith('success', expect.any(String));
  });

  test('redireciona para listagem de relatórios se o serviço falhar', async () => {
    mockGetReport.mockRejectedValue(new Error('Fetch Error'));
    render(<RelatorioDetalhado />);

    await waitFor(() => {
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'Erro ao carregar relatório.');
      expect(mockPush).toHaveBeenCalledWith('/admin/relatorios');
    });
  });
});
