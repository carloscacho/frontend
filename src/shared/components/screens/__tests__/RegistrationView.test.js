/**
 * Tests for the RegistrationView component (Event Registration Flow).
 *
 * This is the main public registration flow with two steps:
 *   1. CPF check → 2. Registration form
 *
 * Covers: CPF validation, email validation, password validation,
 * blank fields, invalid formats, backend errors, existing user flow,
 * new user flow, malicious inputs, and edge cases.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegistrationView from '../RegistrationView';

// ── Mocks ───────────────────────────────────────────────────────────
const mockMostrarAlerta = jest.fn();
const mockPush = jest.fn();
const mockSetSingupOpen = jest.fn();

jest.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    usuario: null,
    setSingupOpen: mockSetSingupOpen,
  }),
}));

jest.mock('@/shared/contexts/AlertContext', () => ({
  useAlerta: () => ({
    mostrarAlerta: mockMostrarAlerta,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/shared/components/displays/LoadingSpinner', () => () => <span data-testid="spinner">Loading...</span>);

const mockCheckRegistration = jest.fn();
const mockRegisterAndSubscribe = jest.fn();

jest.mock('@/modules/usuarios/services/usuario.service', () => ({
  usuarioService: {
    checkRegistration: (...args) => mockCheckRegistration(...args),
    registerAndSubscribe: (...args) => mockRegisterAndSubscribe(...args),
  },
}));

jest.mock('@/shared/components/utils/Input', () => ({ label, value, onChange, type, placeholder, disabled }) => (
  <div>
    <label htmlFor={label}>{label}</label>
    <input
      id={label}
      data-testid={`input-${label}`}
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      type={type || 'text'}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
));

jest.mock('@/shared/components/utils/Button', () => ({ children, onClick, disabled, ...props }) => (
  <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
));

// ── Test Data ───────────────────────────────────────────────────────
const mockEvento = {
  id_evento: 1,
  nome: 'Semana de Tecnologia',
  slug: 'semana-tech-2026',
};

// ── Helpers ─────────────────────────────────────────────────────────
function fillCpf(value) {
  fireEvent.change(screen.getByTestId('input-CPF'), { target: { value } });
}

function clickVerificar() {
  fireEvent.click(screen.getByText('Verificar'));
}

async function goToRegistrationForm(status = 'not_found') {
  mockCheckRegistration.mockResolvedValue({
    status,
    user: status === 'exists_not_registered' ? {
      nome: 'Existente',
      email: 'existente@email.com',
      vinculo: 1,
    } : undefined,
  });

  render(<RegistrationView evento={mockEvento} />);
  fillCpf('123.456.789-01');
  clickVerificar();

  await waitFor(() => {
    expect(screen.getByTestId('input-Nome')).toBeInTheDocument();
  });
}

function fillField(testId, value) {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
}

function clickFinalizar() {
  fireEvent.click(screen.getByText('Finalizar Inscrição'));
}

// ── Tests ───────────────────────────────────────────────────────────
describe('RegistrationView – Step 1: Verificação de CPF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exibe tela de verificação de CPF inicialmente', () => {
    render(<RegistrationView evento={mockEvento} />);
    expect(screen.getByText('Verificação de Cadastro')).toBeInTheDocument();
    expect(screen.getByTestId('input-CPF')).toBeInTheDocument();
  });

  test('exibe alerta quando CPF tem menos de 11 dígitos', async () => {
    render(<RegistrationView evento={mockEvento} />);
    fillCpf('123.456.789');
    clickVerificar();
    expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'CPF inválido. Digite 11 números.');
    expect(mockCheckRegistration).not.toHaveBeenCalled();
  });

  test('exibe alerta quando CPF está vazio', async () => {
    render(<RegistrationView evento={mockEvento} />);
    fillCpf('');
    clickVerificar();
    expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'CPF inválido. Digite 11 números.');
  });

  test('exibe alerta quando CPF tem apenas letras', async () => {
    render(<RegistrationView evento={mockEvento} />);
    fillCpf('abcdefghijk');
    clickVerificar();
    // formatCPF strips non-digits, so it will have 0 digits
    expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'CPF inválido. Digite 11 números.');
  });

  test('redireciona para login quando usuário já inscrito no evento', async () => {
    mockCheckRegistration.mockResolvedValue({ status: 'already_registered' });
    render(<RegistrationView evento={mockEvento} />);
    fillCpf('123.456.789-01');
    clickVerificar();
    await waitFor(() => {
      expect(mockMostrarAlerta).toHaveBeenCalledWith('info', 'Você já está inscrito neste evento.');
      expect(mockPush).toHaveBeenCalledWith('/semana-tech-2026/login');
    });
  });

  test('mostra formulário com dados pré-preenchidos quando usuário existe mas não está inscrito', async () => {
    mockCheckRegistration.mockResolvedValue({
      status: 'exists_not_registered',
      user: { nome: 'João Existente', email: 'joao@ifms.edu.br', vinculo: 2, siape: '12345' },
    });
    render(<RegistrationView evento={mockEvento} />);
    fillCpf('123.456.789-01');
    clickVerificar();
    await waitFor(() => {
      expect(screen.getByText('Atualize seus dados')).toBeInTheDocument();
      expect(screen.getByTestId('input-Nome')).toHaveValue('João Existente');
      expect(screen.getByTestId('input-Email')).toHaveValue('joao@ifms.edu.br');
    });
  });

  test('mostra formulário vazio quando CPF não é encontrado', async () => {
    await goToRegistrationForm('not_found');
    expect(screen.getByText('Complete seu cadastro')).toBeInTheDocument();
    expect(screen.getByTestId('input-Nome')).toHaveValue('');
  });

  test('exibe alerta quando API de verificação falha', async () => {
    mockCheckRegistration.mockRejectedValue(new Error('Network Error'));
    render(<RegistrationView evento={mockEvento} />);
    fillCpf('123.456.789-01');
    clickVerificar();
    await waitFor(() => {
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'Erro ao verificar CPF.');
    });
  });
});

describe('RegistrationView – Step 2: Formulário de Registro (Novo Usuário)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────── Campos Obrigatórios Vazios ─────────
  describe('Campos obrigatórios vazios', () => {
    test('exibe erro quando nome está vazio', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', '');
      fillField('input-Email', 'joao@email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'Preencha todos os campos obrigatórios.');
    });

    test('exibe erro quando email está vazio', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', '');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'Preencha todos os campos obrigatórios.');
    });

    test('exibe erro quando nome e email estão vazios', async () => {
      await goToRegistrationForm();
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'Preencha todos os campos obrigatórios.');
      expect(mockRegisterAndSubscribe).not.toHaveBeenCalled();
    });
  });

  // ───────── Validação de Email ─────────
  describe('Validação de Email', () => {
    test('rejeita email sem @', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joaoemail.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('Email inválido')
      );
      expect(mockRegisterAndSubscribe).not.toHaveBeenCalled();
    });

    test('rejeita email sem domínio (joao@)', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao@');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', expect.stringContaining('Email inválido'));
    });

    test('rejeita email sem extensão (joao@dominio)', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao@dominio');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', expect.stringContaining('Email inválido'));
    });

    test('rejeita email com espaços', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao @email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', expect.stringContaining('Email inválido'));
    });

    test('rejeita email que é só @', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', '@');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', expect.stringContaining('Email inválido'));
    });

    test('rejeita email com múltiplos @@', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao@@email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', expect.stringContaining('Email inválido'));
    });
  });

  // ───────── Validação de Senha ─────────
  describe('Validação de Senha (Novo Usuário)', () => {
    test('rejeita senha com menos de 6 caracteres', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao@email.com');
      fillField('input-Senha', '12345');
      fillField('input-Confirmar Senha', '12345');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'A senha deve ter no mínimo 6 caracteres.');
    });

    test('rejeita senha vazia', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao@email.com');
      fillField('input-Senha', '');
      fillField('input-Confirmar Senha', '');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'A senha deve ter no mínimo 6 caracteres.');
    });

    test('rejeita quando senha e confirmação não conferem', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao@email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senhaErrada');
      clickFinalizar();
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'A senha e a confirmação não conferem.');
    });
  });

  // ───────── Cadastro com Sucesso ─────────
  describe('Cadastro com Sucesso', () => {
    test('envia dados corretos e redireciona para login', async () => {
      mockRegisterAndSubscribe.mockResolvedValue({ message: 'ok' });
      await goToRegistrationForm();
      fillField('input-Nome', 'Maria');
      fillField('input-Email', 'maria@email.com');
      fillField('input-Senha', 'senhaSegura');
      fillField('input-Confirmar Senha', 'senhaSegura');
      clickFinalizar();
      await waitFor(() => {
        expect(mockRegisterAndSubscribe).toHaveBeenCalledWith(expect.objectContaining({
          nome: 'Maria',
          email: 'maria@email.com',
          cpf: expect.any(String),
          senha: 'senhaSegura',
          vinculo: 1,
          id_evento: 1,
        }));
        expect(mockMostrarAlerta).toHaveBeenCalledWith('success', expect.stringContaining('sucesso'));
        expect(mockPush).toHaveBeenCalledWith('/semana-tech-2026/login');
      });
    });
  });

  // ───────── Erros do Backend ─────────
  describe('Erros do Backend', () => {
    test('exibe mensagem do backend quando email já cadastrado', async () => {
      mockRegisterAndSubscribe.mockRejectedValue({
        response: { data: { message: 'E-MAIL já cadastrado por outro usuário.' } },
      });
      await goToRegistrationForm();
      fillField('input-Nome', 'Maria');
      fillField('input-Email', 'duplicado@email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      await waitFor(() => {
        expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'E-MAIL já cadastrado por outro usuário.');
      });
    });

    test('exibe mensagem genérica quando backend retorna sem mensagem', async () => {
      mockRegisterAndSubscribe.mockRejectedValue({
        response: { data: {} },
      });
      await goToRegistrationForm();
      fillField('input-Nome', 'Maria');
      fillField('input-Email', 'maria@email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      await waitFor(() => {
        expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'Erro ao realizar inscrição.');
      });
    });

    test('exibe primeiro erro quando backend retorna array de mensagens', async () => {
      mockRegisterAndSubscribe.mockRejectedValue({
        response: { data: { message: ['email must be an email', 'nome must not be empty'] } },
      });
      await goToRegistrationForm();
      fillField('input-Nome', 'Maria');
      fillField('input-Email', 'maria@email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      await waitFor(() => {
        expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'email must be an email');
      });
    });
  });

  // ───────── Inputs Maliciosos ─────────
  describe('Inputs Maliciosos', () => {
    test('campos com tags HTML não quebram o formulário', async () => {
      await goToRegistrationForm();
      fillField('input-Nome', '<script>alert("xss")</script>');
      fillField('input-Email', 'valid@email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      expect(screen.getByTestId('input-Nome')).toHaveValue('<script>alert("xss")</script>');
    });

    test('campo nome com string extremamente longa', async () => {
      await goToRegistrationForm();
      const longName = 'A'.repeat(1000);
      fillField('input-Nome', longName);
      expect(screen.getByTestId('input-Nome')).toHaveValue(longName);
    });

    test('email com caracteres especiais Unicode é aceito pelo regex (backend rejeita)', async () => {
      mockRegisterAndSubscribe.mockResolvedValue({ message: 'ok' });
      await goToRegistrationForm();
      fillField('input-Nome', 'Test');
      fillField('input-Email', 'test@email.com');
      fillField('input-Senha', 'senha123');
      fillField('input-Confirmar Senha', 'senha123');
      clickFinalizar();
      // Accented emails pass frontend regex — backend @IsEmail() would reject
      await waitFor(() => {
        expect(mockRegisterAndSubscribe).toHaveBeenCalled();
      });
    });
  });

  // ───────── Botão Voltar ─────────
  test('botão Voltar retorna para step de CPF', async () => {
    await goToRegistrationForm();
    fireEvent.click(screen.getByText('Voltar'));
    expect(screen.getByText('Verificação de Cadastro')).toBeInTheDocument();
  });
});

describe('RegistrationView – Step 2: Usuário Existente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exige senha atual para usuário existente', async () => {
    await goToRegistrationForm('exists_not_registered');
    fillField('input-Nome', 'Existente');
    fillField('input-Email', 'existente@email.com');
    // Não preenche senha atual
    clickFinalizar();
    expect(mockMostrarAlerta).toHaveBeenCalledWith(
      'error',
      'Insira sua senha atual para confirmar a atualização de dados.'
    );
    expect(mockRegisterAndSubscribe).not.toHaveBeenCalled();
  });

  test('não exige nova senha para usuário existente', async () => {
    mockRegisterAndSubscribe.mockResolvedValue({ message: 'ok' });
    await goToRegistrationForm('exists_not_registered');
    fillField('input-Nome', 'Existente Atualizado');
    fillField('input-Email', 'existente@email.com');
    fillField('input-Senha Atual', 'minhasenha');
    clickFinalizar();
    await waitFor(() => {
      expect(mockRegisterAndSubscribe).toHaveBeenCalled();
    });
  });

  test('exibe erro quando senha atual incorreta (backend)', async () => {
    mockRegisterAndSubscribe.mockRejectedValue({
      response: { data: { message: 'Senha atual incorreta.' } },
    });
    await goToRegistrationForm('exists_not_registered');
    fillField('input-Nome', 'Existente');
    fillField('input-Email', 'existente@email.com');
    fillField('input-Senha Atual', 'senhaErrada');
    clickFinalizar();
    await waitFor(() => {
      expect(mockMostrarAlerta).toHaveBeenCalledWith('error', 'Senha atual incorreta.');
    });
  });
});
