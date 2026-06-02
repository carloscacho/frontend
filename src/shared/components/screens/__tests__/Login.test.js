/**
 * Tests for the Login component.
 *
 * Covers: empty fields, invalid credentials, API errors,
 * successful login, and navigation to registration page.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../Login';

// ── Mocks ───────────────────────────────────────────────────────────
const mockLogin = jest.fn();
const mockPush = jest.fn();

jest.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ slug: 'evento-teste' }),
}));

jest.mock('@/shared/components/displays/Card', () => ({ children }) => <div>{children}</div>);
jest.mock('@/shared/components/utils/Button', () => ({ children, onClick, ...props }) => (
  <button onClick={onClick} {...props}>{children}</button>
));

// ── Helpers ─────────────────────────────────────────────────────────
function getEmailInput() {
  return screen.getByPlaceholderText('email');
}
function getSenhaInput() {
  return screen.getByPlaceholderText('senha');
}
function clickEntrar() {
  fireEvent.click(screen.getByText('Entrar'));
}

// ── Tests ───────────────────────────────────────────────────────────
describe('Login – Validações e Fluxo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────── Campos Vazios ─────────
  describe('Campos Vazios', () => {
    test('chama login com campos vazios e exibe erro do backend', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
      render(<Login redirectPath="/admin/home" />);
      clickEntrar();
      await waitFor(() => {
        expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
      });
    });

    test('chama login com email vazio e senha preenchida', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getSenhaInput(), { target: { value: 'senha123' } });
      clickEntrar();
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('', 'senha123', '/admin/home');
      });
    });

    test('chama login com email preenchido e senha vazia', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getEmailInput(), { target: { value: 'teste@email.com' } });
      clickEntrar();
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('teste@email.com', '', '/admin/home');
      });
    });
  });

  // ───────── Credenciais Inválidas ─────────
  describe('Credenciais Inválidas', () => {
    test('exibe erro quando email não existe no sistema', async () => {
      mockLogin.mockRejectedValue(new Error('Usuário com email naoexiste@email.com não encontrado'));
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getEmailInput(), { target: { value: 'naoexiste@email.com' } });
      fireEvent.change(getSenhaInput(), { target: { value: 'qualquersenha' } });
      clickEntrar();
      await waitFor(() => {
        expect(screen.getByText(/não encontrado/i)).toBeInTheDocument();
      });
    });

    test('exibe erro quando senha está incorreta', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getEmailInput(), { target: { value: 'joao@email.com' } });
      fireEvent.change(getSenhaInput(), { target: { value: 'senhaErrada' } });
      clickEntrar();
      await waitFor(() => {
        expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
      });
    });

    test('exibe mensagem genérica quando erro não tem mensagem', async () => {
      mockLogin.mockRejectedValue(new Error());
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getEmailInput(), { target: { value: 'joao@email.com' } });
      fireEvent.change(getSenhaInput(), { target: { value: 'senha' } });
      clickEntrar();
      await waitFor(() => {
        expect(screen.getByText('Erro ao fazer login')).toBeInTheDocument();
      });
    });
  });

  // ───────── Login com Sucesso ─────────
  describe('Login com Sucesso', () => {
    test('não exibe erro e chama login corretamente', async () => {
      mockLogin.mockResolvedValue(undefined);
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getEmailInput(), { target: { value: 'joao@email.com' } });
      fireEvent.change(getSenhaInput(), { target: { value: 'senhaCorreta' } });
      clickEntrar();
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('joao@email.com', 'senhaCorreta', '/admin/home');
      });
      // Nenhum alert de erro deve aparecer
      expect(screen.queryByText(/Erro/i)).not.toBeInTheDocument();
    });
  });

  // ───────── Inputs Maliciosos ─────────
  describe('Inputs Maliciosos / Edge Cases', () => {
    test('tenta login com email contendo SQL injection', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getEmailInput(), { target: { value: "' OR 1=1 --" } });
      fireEvent.change(getSenhaInput(), { target: { value: "' OR 1=1 --" } });
      clickEntrar();
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("' OR 1=1 --", "' OR 1=1 --", '/admin/home');
      });
    });

    test('tenta login com email contendo HTML/script', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getEmailInput(), { target: { value: '<script>alert("xss")</script>' } });
      fireEvent.change(getSenhaInput(), { target: { value: 'senha123' } });
      clickEntrar();
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });

    test('tenta login com email extremamente longo', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
      const longEmail = 'a'.repeat(500) + '@email.com';
      render(<Login redirectPath="/admin/home" />);
      fireEvent.change(getEmailInput(), { target: { value: longEmail } });
      fireEvent.change(getSenhaInput(), { target: { value: 'senha123' } });
      clickEntrar();
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(longEmail, 'senha123', '/admin/home');
      });
    });
  });

  // ───────── Navegação ─────────
  describe('Navegação', () => {
    test('botão "Inscreva-se no Evento" navega para página de inscrição', () => {
      render(<Login redirectPath="/admin/home" />);
      fireEvent.click(screen.getByText('Inscreva-se no Evento'));
      expect(mockPush).toHaveBeenCalledWith('/evento-teste/inscricao');
    });
  });

  // ───────── Limpa Erro Anterior ─────────
  test('limpa erro anterior ao tentar login novamente', async () => {
    mockLogin
      .mockRejectedValueOnce(new Error('Credenciais inválidas'))
      .mockResolvedValueOnce(undefined);

    render(<Login redirectPath="/admin/home" />);

    // Primeiro: erro
    fireEvent.change(getEmailInput(), { target: { value: 'joao@email.com' } });
    fireEvent.change(getSenhaInput(), { target: { value: 'senhaErrada' } });
    clickEntrar();
    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });

    // Segundo: sucesso - erro deve sumir
    fireEvent.change(getSenhaInput(), { target: { value: 'senhaCorreta' } });
    clickEntrar();
    await waitFor(() => {
      expect(screen.queryByText('Credenciais inválidas')).not.toBeInTheDocument();
    });
  });
});
