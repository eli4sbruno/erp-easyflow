import React, { useState } from "react";
import { supabase } from "@/supabaseClient";

export default function Login({ setSession }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Criar nova conta
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Verifique seu email para o link de confirmação!');
      } else {
        // Fazer login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#F5F7FA]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0F4C81] rounded-lg mb-4 text-white font-bold text-xl">
            EF
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isSignUp ? 'Criar Nova Conta' : 'Acesse o EasyFlow'}
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            {isSignUp ? 'Preencha os dados para iniciar' : 'Insira suas credenciais para entrar'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F4C81] text-white py-2.5 rounded-lg font-medium hover:bg-[#0a3861] transition-colors disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem acesso?'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 text-[#1B9C85] font-semibold hover:underline"
          >
            {isSignUp ? 'Faça Login' : 'Cadastre-se'}
          </button>
        </div>

      </div>
    </div>
  );
}