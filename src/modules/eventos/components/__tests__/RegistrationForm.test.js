/**
 * Tests for the RegistrationForm component (event-specific registration).
 *
 * Covers: password validation, email validation, CPF validation,
 * valid submission, backend errors, and edge cases.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegistrationForm from '../RegistrationForm';

// ── Mocks ───────────────────────────────────────────────────────────
const mockCadastrar = jest.fn();
const mockSetSingupOpen = jest.fn();

jest.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    cadastrar: mockCadastrar,
    setSingupOpen: mockSetSingupOpen,
  }),
}));

jest.mock('@/shared/components/displays/Card', () => ({ children }) => <div>{children}</div>);
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
  fillField('input-Nome', 'Maria');
  fillField('input-Email', 'maria@email.com');
  fillField('input-CPF', '12345678901');
  fillField('input-Senha', 'senhaSegura');
  fillField('input-Conf Senha', 'senhaSegura');
}

function clickCriar() {
  fireEvent.click(screen.getByText('Criar'));
}

// ── Tests ───────────────────────────────────────────────────────────
describe('RegistrationForm – Validações', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────── Senha ─────────
  describe('Validação de Senha', () => {
    test('rejeita senha curta (< 6 chars)', () => {
      render(<RegistrationForm />);
      fillField('input-Senha', '12345');
      fillField('input-Conf Senha', '12345');
      clickCriar();
      expect(screen.getByText(/Senha deve ter no minimo seis caracteres/i)).toBeInTheDocument();
      expect(mockCadastrar).not.toHaveBeenCalled();
    });

    test('rejeita senhas diferentes', () => {
      render(<RegistrationForm />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'outrasenha');
      clickCriar();
      expect(screen.getByText(/Senha e Confirmação de senha são diferentes/i)).toBeInTheDocument();
    });
  });

  // ───────── Email ─────────
  describe('Validação de Email', () => {
    const invalidEmails = [
      { email: 'semdominio', desc: 'sem @' },
      { email: 'joao@', desc: 'sem domínio' },
      { email: '@email.com', desc: 'sem nome' },
      { email: 'joao@dominio', desc: 'sem extensão' },
      { email: 'joao @email.com', desc: 'com espaço' },
      { email: 'joao@@email.com', desc: 'duplo @' },
    ];

    invalidEmails.forEach(({ email, desc }) => {
      test(`rejeita email ${desc}: "${email}"`, () => {
        render(<RegistrationForm />);
        fillField('input-Senha', 'senha123');
        fillField('input-Conf Senha', 'senha123');
        fillField('input-Email', email);
        fillField('input-CPF', '12345678901');
        clickCriar();
        expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
        expect(mockCadastrar).not.toHaveBeenCalled();
      });
    });

    test('aceita email válido', () => {
      render(<RegistrationForm />);
      fillValidForm();
      clickCriar();
      // Não deve mostrar erro de email
      expect(screen.queryByText(/Email inválido/i)).not.toBeInTheDocument();
    });
  });

  // ───────── CPF ─────────
  describe('Validação de CPF', () => {
    test('rejeita CPF com menos de 11 dígitos', () => {
      render(<RegistrationForm />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', 'maria@email.com');
      fillField('input-CPF', '123456');
      clickCriar();
      expect(screen.getByText(/CPF deve ter no minimo onze caracteres/i)).toBeInTheDocument();
    });

    test('rejeita CPF vazio', () => {
      render(<RegistrationForm />);
      fillField('input-Senha', 'senha123');
      fillField('input-Conf Senha', 'senha123');
      fillField('input-Email', 'maria@email.com');
      fillField('input-CPF', '');
      clickCriar();
      expect(screen.getByText(/CPF deve ter no minimo onze caracteres/i)).toBeInTheDocument();
    });
  });

  // ───────── Cadastro Válido ─────────
  describe('Cadastro Válido', () => {
    test('chama cadastrar com dados válidos', async () => {
      mockCadastrar.mockResolvedValue(undefined);
      render(<RegistrationForm />);
      fillValidForm();
      clickCriar();
      await waitFor(() => {
        expect(mockCadastrar).toHaveBeenCalledWith({
          nome: 'Maria',
          email: 'maria@email.com',
          cpf: '12345678901',
          senha: 'senhaSegura',
        });
      });
    });

    test('exibe erro do backend ao falhar', async () => {
      mockCadastrar.mockRejectedValue(new Error('CPF ou E-MAIL já cadastrados'));
      render(<RegistrationForm />);
      fillValidForm();
      clickCriar();
      await waitFor(() => {
        expect(screen.getByText('CPF ou E-MAIL já cadastrados')).toBeInTheDocument();
      });
    });
  });

  // ───────── Botão Voltar ─────────
  test('botão Voltar fecha o formulário', () => {
    render(<RegistrationForm />);
    fireEvent.click(screen.getByText('Voltar'));
    expect(mockSetSingupOpen).toHaveBeenCalledWith(false);
  });

  // ───────── Ordem de Validação ─────────
  test('valida na ordem: senha → email → CPF', () => {
    render(<RegistrationForm />);
    fillField('input-Senha', '123'); // curta
    fillField('input-Conf Senha', '456'); // diferente
    fillField('input-Email', 'invalido'); // sem @
    fillField('input-CPF', '123'); // curto
    clickCriar();
    // Primeiro erro: senha curta
    expect(screen.getByText(/Senha deve ter no minimo seis caracteres/i)).toBeInTheDocument();
    expect(screen.queryByText(/Email inválido/i)).not.toBeInTheDocument();
  });
});
