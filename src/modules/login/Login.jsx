"use client";
import React, { useState } from 'react';
import { supabase } from "@/supabaseClient";

// Ícone do Google em SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'error' ou 'success'

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (view === 'login') {
      // ---------------- LOGIN ----------------
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: 'E-mail ou senha incorretos.', type: 'error' });
      } else {
        if (onLoginSuccess) onLoginSuccess();
      }

    } else if (view === 'register') {
      // ---------------- CADASTRO ----------------
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: 'Conta criada! Verifique seu e-mail para confirmar.', type: 'success' });
        setTimeout(() => setView('login'), 3000);
      }

    } else if (view === 'forgot') {
      // ---------------- RECUPERAR SENHA ----------------
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Volta para o site após redefinir
      });
      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: 'Link de recuperação enviado para o seu e-mail.', type: 'success' });
        setTimeout(() => setView('login'), 3000);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setMessage({ text: error.message, type: 'error' });
  };

  const toggleView = (newView) => {
    setView(newView);
    setMessage({ text: '', type: '' });
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        
        {/* Cabeçalho do Card */}
        <div className="bg-[#0F4C81] p-8 text-center">
          <h1 className="text-3xl font-black text-white tracking-widest flex justify-center items-center gap-1">
            EASY<span className="text-[#1B9C85]">FLOW</span>
          </h1>
          <p className="text-blue-100 text-sm mt-2 font-medium">Gestão Inteligente para sua Gráfica</p>
        </div>

        {/* Corpo do Card */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
            {view === 'login' && 'Acesse sua conta'}
            {view === 'register' && 'Crie sua nova conta'}
            {view === 'forgot' && 'Recuperar Senha'}
          </h2>

          {message.text && (
            <div className={`p-3 mb-6 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-colors text-slate-700 font-medium"
              />
            </div>

            {view !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Senha</label>
                  {view === 'login' && (
                    <button type="button" onClick={() => toggleView('forgot')} className="text-xs font-bold text-[#1B9C85] hover:underline">
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-colors text-slate-700 font-medium"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-[#0F4C81] hover:bg-[#0a3863] text-white rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-70 mt-2"
            >
              {loading ? 'Aguarde...' : (
                view === 'login' ? 'Entrar no Sistema' : 
                view === 'register' ? 'Criar Conta' : 
                'Enviar link de recuperação'
              )}
            </button>
          </form>

          {/* Divisor "ou" e Login com Google (Apenas visível em Login e Cadastro) */}
          {view !== 'forgot' && (
            <>
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-slate-400 text-sm font-medium">ou</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <GoogleIcon />
                Continuar com o Google
              </button>
            </>
          )}

          {/* Links de Rodapé */}
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            {view === 'login' && (
              <p>Não tem uma conta? <button onClick={() => toggleView('register')} className="text-[#0F4C81] font-bold hover:underline">Cadastre-se</button></p>
            )}
            {view === 'register' && (
              <p>Já tem uma conta? <button onClick={() => toggleView('login')} className="text-[#0F4C81] font-bold hover:underline">Faça login</button></p>
            )}
            {view === 'forgot' && (
              <p><button onClick={() => toggleView('login')} className="text-[#0F4C81] font-bold hover:underline flex items-center justify-center gap-1 w-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Voltar para o login</button></p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}