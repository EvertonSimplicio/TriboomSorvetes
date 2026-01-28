
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de login baseado no e-mail para testes de permissão
    setTimeout(() => {
      let role: 'Admin' | 'Gerente' | 'Operador' = 'Admin';
      
      if (email.includes('gerente')) role = 'Gerente';
      if (email.includes('operador') || email.includes('func')) role = 'Operador';

      onLogin({
        id: '1',
        name: role === 'Admin' ? 'Diretor Administrativo' : role === 'Gerente' ? 'Gerente de Unidade' : 'Colaborador Triboom',
        email: email,
        role: role
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-100 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-amber-100 rounded-full blur-[100px] opacity-60"></div>

      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 relative z-10">
        <div>
          <div className="flex justify-center">
            <div className="bg-red-600 p-4 rounded-3xl shadow-xl shadow-red-200 rotate-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-8 text-center text-4xl font-black tracking-tighter text-slate-800">
            Triboom <span className="text-red-600">Sorvetes</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-bold uppercase tracking-widest">
            Acesse o Painel ERP
          </p>
        </div>
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">E-mail Corporativo</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="block w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-slate-800 placeholder-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none font-bold transition-all bg-slate-50"
                placeholder="nome@triboom.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-1 text-[9px] text-slate-400 font-medium">Dica: use 'gerente@...' ou 'operador@...' para testar permissões.</p>
            </div>
            <div>
              <label htmlFor="password" id="password-label" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Senha de Acesso</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-slate-800 placeholder-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none font-bold transition-all bg-slate-50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-2xl bg-red-600 py-4 px-4 text-sm font-black text-white shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
            </button>
          </div>
          
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-6">
            ERP v2.5 • <span className="text-amber-500">Triboom Intelligence</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
