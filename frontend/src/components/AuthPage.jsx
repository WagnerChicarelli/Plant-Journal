import { useState } from 'react';
import { loginUser, registerUser, validateEmailDomain } from '../services/api.js';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function validatePassword(pw) {
    if (pw.length < 8) return 'A senha precisa ter pelo menos 8 letras.';
    if (!/[A-Z]/.test(pw)) return 'A senha precisa ter pelo menos 1 letra maiúscula (A, B, C...).';
    if (!/[a-z]/.test(pw)) return 'A senha precisa ter pelo menos 1 letra minúscula (a, b, c...).';
    if (!/[0-9]/.test(pw)) return 'A senha precisa ter pelo menos 1 número (0, 1, 2...).';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return 'A senha precisa ter pelo menos 1 símbolo (!, @, #...).';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Digite um email válido.');
        setLoading(false);
        return;
      }

      const domainCheck = await validateEmailDomain(email);
      if (!domainCheck.valid) {
        setError(domainCheck.error);
        setLoading(false);
        return;
      }

      if (isLogin) {
        let result;
        result = await loginUser({ email, password });
        onLogin(result.user, result.token);
      } else {
        if (email !== confirmEmail) {
          setError('Os emails não são iguais. Digite novamente.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('As senhas não são iguais. Digite novamente.');
          setLoading(false);
          return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        let result;
        result = await registerUser({ name, email, password });
        onLogin(result.user, result.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsLogin(!isLogin);
    setError(null);
    setName('');
    setEmail('');
    setConfirmEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h2>{isLogin ? 'Login' : 'Cadastrar'}</h2>
        </div>

        {error && <p className="error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-field">
              <label>Usuário</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Digite seu nome"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label>Confirmar Email</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={e => setConfirmEmail(e.target.value)}
                placeholder="Confirme seu email"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              minLength={8}
            />
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label>Confirmar senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                required
                minLength={8}
              />
            </div>
          )}

          <div className="auth-checkbox">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={e => setShowPassword(e.target.checked)}
            />
            <label htmlFor="showPassword">Exibir senha</label>
          </div>

          {!isLogin && (
            <div className="password-rules">
              <p>Sua senha precisa ter:</p>
              <ul>
                <li className={password.length >= 8 ? 'valid' : ''}>Pelo menos 8 letras</li>
                <li className={/[A-Z]/.test(password) ? 'valid' : ''}>1 letra maiúscula (A, B, C...)</li>
                <li className={/[a-z]/.test(password) ? 'valid' : ''}>1 letra minúscula (a, b, c...)</li>
                <li className={/[0-9]/.test(password) ? 'valid' : ''}>1 número (0, 1, 2...)</li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'valid' : ''}>1 símbolo (!, @, #...)</li>
              </ul>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>Não possui uma conta? <button onClick={toggleMode}>Criar Nova Conta</button></p>
          ) : (
            <p>Possui uma conta? <button onClick={toggleMode}>Entrar no sistema</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
