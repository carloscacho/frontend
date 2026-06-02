/**
 * Tests for the Cadastro (Admin Registration) component.
 *
 * Strategy: render the component with mocked AuthContext,
 * simulate user interactions, and assert that validation errors
 * are shown for invalid inputs before any API call is made.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cadastro from '../Cadastro';

// ── Mocks ───────────────────────────────────────────────────────────
const mockCadastrar = jest.fn();
const mockSetSingupOpen = jest.fn();

jest.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    cadastrar: mockCadastrar,
    setSingupOpen: mockSetSingupOpen,
  }),
}));

// Mock the Card and Input wrappers to pass-through
jest.mock('@/shared/components/displays/Card', () => ({ children }) => <div data-testid="card">{children}</div>);
jest.mock('@/shared/components/utils/Button', () => ({ children, onClick, ...props }) => (
  <button onClick={onClick} {...props}>{children}</button>
));
jest.mock('@/shared/components/utils/Input', () => ({ label, value, onChange, type, placeholder }) => (
  <div>
    <label htmlFor={label}>{label}</label>
    <input
      id={label}
      data-testid={`input-${label}`}
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      type={type || 'text'}
      placeholder={placeholder}
    />
  </div>
));

// ── Helpers ─────────────────────────────────────────────────────────
function fillField(testId, value) {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
}

function fillValidForm() {
  fillField('input-Nome', 'João Silva');
  fillField('input-Email', 'joao@email.com');
  fillField('input-CPF', '12345678901');
  fillField('input-Senha', 'senhaSegura123');
  fillField('input-Conf Senha', 'senhaSegura123');
}

function clickCriar() {
  fireEvent.click(screen.getByText('Criar'));
}

// ── Tests ───────────────────────────────────────────────────────────
describe('Cadastro – Validações de Frontend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────── Senha ─────────
  describe('Validação de Senha', () => {
    test('exibe erro quando senha tem menos de 6 caracteres', () => {
      render(<Cadastro />);
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao@email.com');
      fillField('input-CPF', '12345678901');
      fillField('input-Senha', '123');
      fillField('input-Conf Senha', '123');
      clickCriar();
      expect(screen.getByText(/Senha deve ter no minimo seis caracteres/i)).toBeInTheDocument();
      expect(mockCadastrar).not.toHaveBeenCalled();
    });

    test('exibe erro quando senha está vazia', () => {
      render(<Cadastro />);
      fillField('input-Nome', 'João');
      fillField('input-Email', 'joao@email.com');
      fillField('input-CPF', '12345678901');
      fillField('input-Senha', '');
      fillField('input-Conf Senha', '');
      clickCriar();
      expect(screen.getByText(/Senha deve ter no minimo seis caracteres/i)).toBeInTheDocument();
      expect(mockCadastrar).not.toHaveBeenCalled();
    });

    test('exibe erro quando senha tem exatamente 5 caracteres', () => {
      render(<Cadastro />);
      fillField('input-Senha', '12345');
      fillField('input-Conf Senha', '12345');
      clickCriar();
      expect(screen.getByText(/Senha deve ter no minimo seis caracteres/i)).toBeInTheDocument();
    });

    test('exibe erro quando senhas não conferem', () => {
      render(<Cadastro />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senhaErrada');
      clickCriar();
      expect(screen.getByText(/Senha e Confirmação de senha são diferentes/i)).toBeInTheDocument();
      expect(mockCadastrar).not.toHaveBeenCalled();
    });
  });

  // ───────── Email ─────────
  describe('Validação de Email', () => {
    test('exibe erro quando email não tem @', () => {
      render(<Cadastro />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', 'joaoemail.com');
      fillField('input-CPF', '12345678901');
      clickCriar();
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
      expect(mockCadastrar).not.toHaveBeenCalled();
    });

    test('exibe erro quando email não tem domínio', () => {
      render(<Cadastro />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', 'joao@');
      fillField('input-CPF', '12345678901');
      clickCriar();
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
    });

    test('exibe erro quando email não tem extensão de domínio', () => {
      render(<Cadastro />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', 'joao@dominio');
      fillField('input-CPF', '12345678901');
      clickCriar();
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
    });

    test('exibe erro quando email tem espaços', () => {
      render(<Cadastro />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', 'joao @email.com');
      fillField('input-CPF', '12345678901');
      clickCriar();
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
    });

    test('exibe erro quando email está vazio', () => {
      render(<Cadastro />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', '');
      fillField('input-CPF', '12345678901');
      clickCriar();
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
    });
  });

  // ───────── CPF ─────────
  describe('Validação de CPF', () => {
    test('exibe erro quando CPF tem menos de 11 dígitos', () => {
      render(<Cadastro />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', 'joao@email.com');
      fillField('input-CPF', '1234567890');
      clickCriar();
      expect(screen.getByText(/cpf deve ter no minimo onze caracteres/i)).toBeInTheDocument();
      expect(mockCadastrar).not.toHaveBeenCalled();
    });

    test('exibe erro quando CPF está vazio', () => {
      render(<Cadastro />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', 'joao@email.com');
      fillField('input-CPF', '');
      clickCriar();
      expect(screen.getByText(/cpf deve ter no minimo onze caracteres/i)).toBeInTheDocument();
    });
  });

  // ───────── Cadastro Válido ─────────
  describe('Cadastro com dados válidos', () => {
    test('chama cadastrar quando todos os campos são válidos', async () => {
      mockCadastrar.mockResolvedValue(undefined);
      render(<Cadastro />);
      fillValidForm();
      clickCriar();
      await waitFor(() => {
        expect(mockCadastrar).toHaveBeenCalledWith({
          nome: 'João Silva',
          email: 'joao@email.com',
          cpf: '12345678901',
          senha: 'senhaSegura123',
        });
      });
    });

    test('exibe mensagem quando cadastrar retorna erro do backend', async () => {
      mockCadastrar.mockRejectedValue(new Error('CPF ou E-MAIL já cadastrados'));
      render(<Cadastro />);
      fillValidForm();
      clickCriar();
      await waitFor(() => {
        expect(screen.getByText('CPF ou E-MAIL já cadastrados')).toBeInTheDocument();
      });
    });
  });

  // ───────── Botão Voltar ─────────
  test('botão Voltar chama setSingupOpen(false)', () => {
    render(<Cadastro />);
    fireEvent.click(screen.getByText('Voltar'));
    expect(mockSetSingupOpen).toHaveBeenCalledWith(false);
  });

  // ───────── Ordem de validação ─────────
  test('valida senha antes do email (prioridade de erros)', () => {
    render(<Cadastro />);
    fillField('input-Senha', '123');
    fillField('input-Conf Senha', '123');
    fillField('input-Email', 'invalido');
    fillField('input-CPF', '123');
    clickCriar();
    // Primeiro erro na cadeia é a senha curta
    expect(screen.getByText(/Senha deve ter no minimo seis caracteres/i)).toBeInTheDocument();
  });
});
