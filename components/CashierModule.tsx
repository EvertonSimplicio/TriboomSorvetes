
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Plus, 
  Search, 
  X, 
  Save, 
  User as UserIcon, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  History,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Store,
  Settings2,
  Settings
} from 'lucide-react';
import { CashierSession } from '../types';

const INITIAL_SHOPS = ['Matriz - Centro', 'Filial 01 - Shopping', 'Filial 02 - Praia'];

const INITIAL_SESSIONS: CashierSession[] = [
  {
    id: 'c1',
    date: '2023-11-20',
    shift: '1024',
    shopName: 'Matriz - Centro',
    employeeName: 'Carlos Oliveira',
    amountCash: 450.00,
    amountDebit: 1200.50,
    amountCredit: 890.00,
    amountPix: 600.00,
    total: 3140.50,
    createdAt: '2023-11-20T14:00:00Z'
  }
];

const CashierModule: React.FC = () => {
  const [sessions, setSessions] = useState<CashierSession[]>(INITIAL_SESSIONS);
  const [shops, setShops] = useState<string[]>(INITIAL_SHOPS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShop, setFilterShop] = useState('Todas');
  const [filterDate, setFilterDate] = useState('');
  
  // Estado para nova loja nas configurações
  const [newShopName, setNewShopName] = useState('');

  const stats = useMemo(() => {
    return sessions.filter(s => {
        const matchesShop = filterShop === 'Todas' ? true : s.shopName === filterShop;
        const matchesDate = !filterDate ? true : s.date === filterDate;
        return matchesShop && matchesDate;
    }).reduce((acc, s) => ({
      cash: acc.cash + s.amountCash,
      debit: acc.debit + s.amountDebit,
      credit: acc.credit + s.amountCredit,
      pix: acc.pix + s.amountPix,
      total: acc.total + s.total
    }), { cash: 0, debit: 0, credit: 0, pix: 0, total: 0 });
  }, [sessions, filterShop, filterDate]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesShop = filterShop === 'Todas' ? true : s.shopName === filterShop;
      const matchesDate = !filterDate ? true : s.date === filterDate;
      const matchesSearch = s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.shift.toString().includes(searchTerm) ||
                           s.shopName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesShop && matchesDate && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sessions, searchTerm, filterShop, filterDate]);

  const handleAddSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const cash = Number(formData.get('amountCash'));
    const debit = Number(formData.get('amountDebit'));
    const credit = Number(formData.get('amountCredit'));
    const pix = Number(formData.get('amountPix'));
    const total = cash + debit + credit + pix;

    const newSession: CashierSession = {
      id: 'c' + Math.random().toString(36).substr(2, 9),
      date: formData.get('date') as string,
      shift: formData.get('shift') as string,
      shopName: formData.get('shopName') as string,
      employeeName: formData.get('employeeName') as string,
      amountCash: cash,
      amountDebit: debit,
      amountCredit: credit,
      amountPix: pix,
      total: total,
      notes: formData.get('notes') as string,
      createdAt: new Date().toISOString()
    };

    setSessions([newSession, ...sessions]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este registro de caixa?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAddShop = () => {
    if (!newShopName.trim()) return;
    if (shops.includes(newShopName.trim())) {
      alert('Esta sorveteria já está cadastrada.');
      return;
    }
    setShops([...shops, newShopName.trim()]);
    setNewShopName('');
  };

  const handleRemoveShop = (shopName: string) => {
    const hasSessions = sessions.some(s => s.shopName === shopName);
    if (hasSessions) {
      alert('Não é possível remover uma sorveteria que possui lançamentos registrados.');
      return;
    }
    if (confirm(`Deseja remover a unidade "${shopName}"?`)) {
      setShops(shops.filter(s => s !== shopName));
      if (filterShop === shopName) setFilterShop('Todas');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Calculator className="w-7 h-7 text-emerald-600" />
            Movimentação de Caixa
          </h2>
          <p className="text-slate-500 font-medium">Gestão de fechamentos por unidade da <span className="text-indigo-600 font-bold">Triboom</span>.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-2.5 rounded-xl transition-all active:scale-95 shadow-sm group"
            title="Configurações de Unidades"
          >
            <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Stats Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Banknote className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Dinheiro</span>
          </div>
          <p className="text-xl font-black text-slate-800">R$ {stats.cash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Débito</span>
          </div>
          <p className="text-xl font-black text-slate-800">R$ {stats.debit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Crédito</span>
          </div>
          <p className="text-xl font-black text-slate-800">R$ {stats.credit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-teal-600 mb-2">
            <Smartphone className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">PIX</span>
          </div>
          <p className="text-xl font-black text-slate-800">R$ {stats.pix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-3xl shadow-xl text-white">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Total Filtrado</span>
          </div>
          <p className="text-xl font-black">R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Pesquisar por funcionário, turno ou unidade..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <Store className="w-4 h-4" />
                    </div>
                    <select 
                        className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-black px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                        value={filterShop}
                        onChange={(e) => setFilterShop(e.target.value)}
                    >
                        <option value="Todas">Todas as Lojas</option>
                        {shops.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <input 
                        type="date"
                        className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-black px-4 py-2.5 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Tabela de Fechamentos */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Turno</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade / Operador</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Meios de Pagamento</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Faturamento</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Turno: {s.shift}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Store className="w-3 h-3 text-indigo-500" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase">{s.shopName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                <UserIcon className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{s.employeeName}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-4 text-center">
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">Din</p><p className="text-xs font-bold text-slate-600">R${s.amountCash.toFixed(0)}</p></div>
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">Deb</p><p className="text-xs font-bold text-slate-600">R${s.amountDebit.toFixed(0)}</p></div>
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">Cre</p><p className="text-xs font-bold text-slate-600">R${s.amountCredit.toFixed(0)}</p></div>
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">PIX</p><p className="text-xs font-bold text-slate-600">R${s.amountPix.toFixed(0)}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-900">
                    R$ {s.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Configuração de Unidades */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                    <Settings2 className="w-6 h-6 text-indigo-600" /> Unidades
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase">Gerenciar Sorveterias</p>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10 space-y-8">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Adicionar Nova Unidade</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold"
                            placeholder="Nome da sorveteria..."
                            value={newShopName}
                            onChange={(e) => setNewShopName(e.target.value)}
                        />
                        <button 
                            onClick={handleAddShop}
                            className="bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades Cadastradas</label>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                        {shops.map(shop => (
                            <div key={shop} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div className="flex items-center gap-3 font-black text-slate-700 text-sm">
                                    <Store className="w-4 h-4 text-slate-400" />
                                    {shop}
                                </div>
                                <button 
                                    onClick={() => handleRemoveShop(shop)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm"
                >
                    Pronto
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lançamento de Caixa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Lançamento de Caixa</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Novo fechamento de turno</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddSession} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Unidade / Sorveteria</label>
                    <div className="relative">
                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                            name="shopName" 
                            required
                            className="w-full pl-12 pr-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none bg-white font-black transition-all"
                        >
                            <option value="">Selecione a Unidade...</option>
                            {shops.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Data</label>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-black" />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Turno (PDV)</label>
                  <input name="shift" type="text" required placeholder="Número do turno..." className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-black" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Operador do Caixa</label>
                  <input name="employeeName" required placeholder="Quem trabalhou?" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold" />
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100 col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valores de Fechamento</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1">Dinheiro</label>
                      <input name="amountCash" type="number" step="0.01" defaultValue="0" className="w-full bg-transparent border-none outline-none text-xl font-black text-emerald-700" />
                    </div>
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Débito</label>
                      <input name="amountDebit" type="number" step="0.01" defaultValue="0" className="w-full bg-transparent border-none outline-none text-xl font-black text-blue-700" />
                    </div>
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                      <label className="block text-[10px] font-black text-indigo-600 uppercase mb-1">Crédito</label>
                      <input name="amountCredit" type="number" step="0.01" defaultValue="0" className="w-full bg-transparent border-none outline-none text-xl font-black text-indigo-700" />
                    </div>
                    <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
                      <label className="block text-[10px] font-black text-teal-600 uppercase mb-1">PIX</label>
                      <input name="amountPix" type="number" step="0.01" defaultValue="0" className="w-full bg-transparent border-none outline-none text-xl font-black text-teal-700" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all">Finalizar Fechamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierModule;
