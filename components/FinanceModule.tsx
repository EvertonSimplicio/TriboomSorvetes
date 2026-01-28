
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  X,
  Save,
  ArrowRightLeft,
  Calendar,
  FileText,
  Trash2,
  Copy,
  Eye,
  Edit3,
  CheckSquare,
  Square,
  Check
} from 'lucide-react';
import { FinanceEntry } from '../types';

const INITIAL_ENTRIES: FinanceEntry[] = [
  { 
    id: 'f1', 
    description: 'Venda de Sorvetes de Massa - Lote 45', 
    type: 'Receita', 
    category: 'Vendas', 
    value: 4500.00, 
    dueDate: '2023-11-30', 
    status: 'Pendente', 
    origin: 'Venda',
    entityName: 'Supermercado Sol'
  },
  { 
    id: 'f2', 
    description: 'Compra de Insumos - NF 12345 (Parc 1/2)', 
    type: 'Despesa', 
    category: 'Insumos', 
    value: 7700.25, 
    dueDate: '2023-11-25', 
    status: 'Pago', 
    origin: 'Nota Fiscal',
    entityName: 'Tecnologia Avançada Ltda'
  },
  { 
    id: 'f3', 
    description: 'Aluguel Pavilhão Industrial', 
    type: 'Despesa', 
    category: 'Infraestrutura', 
    value: 3200.00, 
    dueDate: '2023-11-10', 
    status: 'Atrasado', 
    origin: 'Manual',
    entityName: 'Imobiliária Central'
  },
  { 
    id: 'f4', 
    description: 'Venda Picolés Fruta - Evento Praça', 
    type: 'Receita', 
    category: 'Vendas', 
    value: 850.50, 
    dueDate: '2023-11-12', 
    status: 'Pago', 
    origin: 'Manual',
    entityName: 'Secretaria de Cultura'
  }
];

const FinanceModule: React.FC = () => {
  const [entries, setEntries] = useState<FinanceEntry[]>(INITIAL_ENTRIES);
  const [activeTab, setActiveTab] = useState<'all' | 'Receita' | 'Despesa'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pendente' | 'Pago' | 'Atrasado'>('all');
  
  // Notificações
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Controle de seleção e menu
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<FinanceEntry | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = useMemo(() => {
    const recipes = entries.filter(e => e.type === 'Receita').reduce((acc, e) => acc + e.value, 0);
    const expenses = entries.filter(e => e.type === 'Despesa').reduce((acc, e) => acc + e.value, 0);
    const pendingRecipes = entries.filter(e => e.type === 'Receita' && e.status !== 'Pago').reduce((acc, e) => acc + e.value, 0);
    const pendingExpenses = entries.filter(e => e.type === 'Despesa' && e.status !== 'Pago').reduce((acc, e) => acc + e.value, 0);
    
    return {
      balance: recipes - expenses,
      totalRecipes: recipes,
      totalExpenses: expenses,
      toReceive: pendingRecipes,
      toPay: pendingExpenses
    };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesTab = activeTab === 'all' ? true : e.type === activeTab;
      const matchesStatus = filterStatus === 'all' ? true : e.status === filterStatus;
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           e.entityName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [entries, activeTab, filterStatus, searchTerm]);

  // Funções de Seleção
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredEntries.length && filteredEntries.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map(e => e.id)));
    }
  };

  // Ações Individuais
  const handleToggleStatus = (id: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === id) {
        const newStatus = e.status === 'Pago' ? 'Pendente' : 'Pago';
        return { ...e, status: newStatus as any };
      }
      return e;
    }));
    setToast({ message: 'Status atualizado com sucesso!', type: 'success' });
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
      setToast({ message: 'Lançamento excluído.', type: 'success' });
    }
    setActiveMenuId(null);
  };

  const handleDuplicate = (entry: FinanceEntry) => {
    const newEntry = { 
      ...entry, 
      id: 'f' + Math.random().toString(36).substr(2, 9), 
      status: 'Pendente' as const,
      description: `${entry.description} (Cópia)`
    };
    setEntries([newEntry, ...entries]);
    setToast({ message: 'Lançamento duplicado como rascunho.', type: 'success' });
    setActiveMenuId(null);
  };

  const handleEdit = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleViewDetails = (entry: FinanceEntry) => {
    setViewingEntry(entry);
    setIsDetailModalOpen(true);
    setActiveMenuId(null);
  };

  // Ações em Massa - CORRIGIDAS
  const handleBulkBaixa = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const count = selectedIds.size;
    if (confirm(`Deseja confirmar a baixa de ${count} boletos selecionados?`)) {
      setEntries(prev => prev.map(entry => 
        selectedIds.has(entry.id) ? { ...entry, status: 'Pago' } : entry
      ));
      setSelectedIds(new Set());
      setToast({ message: `${count} títulos baixados com sucesso!`, type: 'success' });
    }
  };

  const handleBulkDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const count = selectedIds.size;
    if (confirm(`Deseja excluir permanentemente os ${count} lançamentos selecionados?`)) {
      setEntries(prev => prev.filter(entry => !selectedIds.has(entry.id)));
      setSelectedIds(new Set());
      setToast({ message: `${count} lançamentos removidos.`, type: 'success' });
    }
  };

  const handleAddEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const entryData: FinanceEntry = {
      id: editingEntry?.id || 'f' + Math.random().toString(36).substr(2, 9),
      description: formData.get('description') as string,
      type: formData.get('type') as any,
      category: formData.get('category') as string,
      value: Number(formData.get('value')),
      dueDate: formData.get('dueDate') as string,
      status: editingEntry?.status || 'Pendente',
      origin: editingEntry?.origin || 'Manual',
      entityName: formData.get('entityName') as string,
    };

    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? entryData : e));
      setToast({ message: 'Lançamento atualizado!', type: 'success' });
    } else {
      setEntries([entryData, ...entries]);
      setToast({ message: 'Novo lançamento registrado!', type: 'success' });
    }
    
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const exportCSV = () => {
    const headers = ['Data Vencimento', 'Descrição', 'Tipo', 'Categoria', 'Fornecedor', 'Valor', 'Status'];
    const rows = filteredEntries.map(e => [
      e.dueDate, e.description, e.type, e.category, e.entityName, e.value.toFixed(2), e.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financeiro_triboom_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    setToast({ message: 'Relatório exportado com sucesso.', type: 'success' });
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-8 z-[200] animate-in slide-in-from-right-8 fade-in duration-300">
           <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'} text-white`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">{toast.message}</span>
           </div>
        </div>
      )}

      {/* Barra de Ações em Massa (Floating) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-300 border border-slate-700/50">
          <div className="flex items-center gap-3 border-r border-slate-700/50 pr-6">
            <div className="bg-indigo-600 text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full shadow-lg shadow-indigo-500/20">
              {selectedIds.size}
            </div>
            <span className="text-sm font-black tracking-tight uppercase">Selecionados</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={handleBulkBaixa}
              className="group flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-sm font-black transition-all active:scale-90 shadow-lg shadow-emerald-500/10"
            >
              <Check className="w-4 h-4 group-hover:scale-110 transition-transform" /> Dar Baixa
            </button>
            <button 
              type="button"
              onClick={handleBulkDelete}
              className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-rose-600 rounded-2xl text-sm font-black transition-all active:scale-90"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Excluir
            </button>
            <button 
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider px-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Header Financeiro */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-amber-500" />
            Fluxo de Caixa
          </h2>
          <p className="text-slate-500 font-medium">Gestão inteligente de contas a pagar e receber da <span className="text-indigo-600 font-bold">Triboom</span>.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Novo Lançamento
          </button>
          <button onClick={exportCSV} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <ArrowRightLeft className="w-16 h-16 text-indigo-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Projetado</p>
          <p className={`text-2xl font-black tracking-tighter ${stats.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
            R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 w-2/3"></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">A Receber</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black tracking-tighter text-emerald-600">
              R$ {stats.toReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="bg-emerald-50 p-1.5 rounded-lg">
               <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">A Pagar</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black tracking-tighter text-rose-600">
              R$ {stats.toPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="bg-rose-50 p-1.5 rounded-lg">
               <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entradas (Mês)</p>
          <p className="text-2xl font-black tracking-tighter">
            R$ {stats.totalRecipes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Conforme projeção mensal</p>
        </div>
      </div>

      {/* Filtros e Tabs */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
            {(['all', 'Receita', 'Despesa'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-xs font-black rounded-xl transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'all' ? 'Tudo' : tab === 'Receita' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <Filter className="w-4 h-4" /> Filtrar:
             </div>
             <select 
               className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-black px-4 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value as any)}
             >
               <option value="all">Todos os Status</option>
               <option value="Pendente">Pendentes</option>
               <option value="Pago">Liquidados</option>
               <option value="Atrasado">Em Atraso</option>
             </select>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="O que você procura? Descrição, Fornecedor ou Cliente..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 w-12 text-center">
                  <button 
                    onClick={toggleAll}
                    className={`transition-all ${selectedIds.size > 0 ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
                  >
                    {selectedIds.size === filteredEntries.length && filteredEntries.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : selectedIds.size > 0 ? (
                      <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                         <div className="w-2.5 h-0.5 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento / Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição detalhada</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Origem</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Líquido</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((e) => (
                <tr 
                  key={e.id} 
                  className={`hover:bg-slate-50/80 transition-all group ${selectedIds.has(e.id) ? 'bg-indigo-50/40' : ''}`}
                >
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={(ev) => { ev.stopPropagation(); toggleSelection(e.id); }}
                      className={`transition-all ${selectedIds.has(e.id) ? 'text-indigo-600 scale-110' : 'text-slate-200 group-hover:text-slate-300'}`}
                    >
                      {selectedIds.has(e.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        e.status === 'Pago' ? 'bg-emerald-100 text-emerald-600' : 
                        e.status === 'Atrasado' ? 'bg-rose-100 text-rose-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {e.status === 'Pago' ? <CheckCircle2 className="w-5 h-5" /> : 
                         e.status === 'Atrasado' ? <AlertCircle className="w-5 h-5 animate-pulse" /> : 
                         <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 tracking-tight">{new Date(e.dueDate).toLocaleDateString('pt-BR')}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${
                          e.status === 'Pago' ? 'text-emerald-500' : 
                          e.status === 'Atrasado' ? 'text-rose-500' : 
                          'text-amber-500'
                        }`}>{e.status}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{e.description}</span>
                      <span className="text-xs text-slate-400 font-medium">{e.entityName} • <span className="uppercase">{e.category}</span></span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                      {e.origin === 'Nota Fiscal' && <FileText className="w-3 h-3" />}
                      {e.origin}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`text-base font-black tracking-tighter ${e.type === 'Receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {e.type === 'Receita' ? '+' : '-'} R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={(ev) => { ev.stopPropagation(); handleToggleStatus(e.id); }}
                        className={`p-2.5 rounded-xl transition-all ${e.status === 'Pago' ? 'text-slate-300 hover:text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50 shadow-sm'}`}
                        title={e.status === 'Pago' ? 'Estornar' : 'Baixar Título'}
                      >
                        {e.status === 'Pago' ? <ArrowRightLeft className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setActiveMenuId(activeMenuId === e.id ? null : e.id);
                          }}
                          className={`p-2.5 rounded-xl transition-all ${activeMenuId === e.id ? 'bg-slate-900 text-white rotate-90 shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {activeMenuId === e.id && (
                          <div 
                            ref={dropdownRef}
                            className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[110] py-3 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden"
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <div className="px-4 pb-2 mb-2 border-b border-slate-50">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ações Rápidas</p>
                            </div>
                            <button 
                              onClick={() => handleViewDetails(e)}
                              className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors font-bold"
                            >
                              <Eye className="w-4 h-4" /> Detalhes
                            </button>
                            <button 
                              onClick={() => handleEdit(e)}
                              className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors font-bold"
                            >
                              <Edit3 className="w-4 h-4" /> Editar
                            </button>
                            <button 
                              onClick={() => handleDuplicate(e)}
                              className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors font-bold"
                            >
                              <Copy className="w-4 h-4" /> Duplicar
                            </button>
                            <div className="h-px bg-slate-50 my-2"></div>
                            <button 
                              onClick={() => handleDelete(e.id)}
                              className="w-full text-left px-5 py-3 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors font-black"
                            >
                              <Trash2 className="w-4 h-4" /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                       <FileText className="w-16 h-16" />
                       <p className="text-sm font-black uppercase tracking-widest">Nenhum lançamento encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALHES */}
      {isDetailModalOpen && viewingEntry && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Resumo do Título</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{viewingEntry.id} • {viewingEntry.origin}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="bg-white p-3 rounded-2xl shadow-sm text-slate-400 hover:text-slate-600 transition-all active:scale-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Título</p>
                    <p className={`text-4xl font-black tracking-tighter ${viewingEntry.type === 'Receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      R$ {viewingEntry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                 </div>
                 <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewingEntry.status === 'Pago' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {viewingEntry.status}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento</p>
                  <p className="font-black text-slate-800">{new Date(viewingEntry.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</p>
                  <p className="font-black text-slate-800 uppercase">{viewingEntry.category}</p>
                </div>
                <div className="col-span-2 space-y-1 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</p>
                  <p className="font-bold text-slate-700 leading-relaxed">{viewingEntry.description}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parceiro Comercial</p>
                  <p className="font-black text-indigo-600">{viewingEntry.entityName}</p>
                </div>
              </div>

              <div className="pt-6">
                 <button 
                  onClick={() => { setIsDetailModalOpen(false); handleEdit(viewingEntry); }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   <Edit3 className="w-5 h-5" /> Abrir para Edição
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lançamento (Novo / Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                  {editingEntry ? 'Alterar Título' : 'Novo Título'}
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  {editingEntry ? `Editando ID: ${editingEntry.id}` : 'Registro de Fluxo de Caixa'}
                </p>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingEntry(null); }} 
                className="bg-white p-3 rounded-2xl shadow-sm text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddEntry} className="p-10 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descrição do Lançamento</label>
                  <input 
                    name="description" 
                    required 
                    defaultValue={editingEntry?.description}
                    placeholder="Ex: Pagamento Internet Link Dedicado" 
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none font-medium transition-all" 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo</label>
                  <select 
                    name="type" 
                    defaultValue={editingEntry?.type || (activeTab === 'all' ? 'Despesa' : activeTab)}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none bg-white font-black transition-all"
                  >
                    <option value="Despesa">Despesa (Saída)</option>
                    <option value="Receita">Receita (Entrada)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Categoria</label>
                  <input 
                    name="category" 
                    required 
                    defaultValue={editingEntry?.category}
                    placeholder="Ex: Operacional" 
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none font-medium transition-all" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fornecedor / Cliente</label>
                  <input 
                    name="entityName" 
                    required 
                    defaultValue={editingEntry?.entityName}
                    placeholder="Quem é o parceiro deste lançamento?" 
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none font-medium transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Valor Bruto (R$)</label>
                  <input 
                    name="value" 
                    type="number" 
                    step="0.01" 
                    required 
                    defaultValue={editingEntry?.value}
                    placeholder="0,00" 
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none font-black text-indigo-600 transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Data Vencimento</label>
                  <input 
                    name="dueDate" 
                    type="date" 
                    required 
                    defaultValue={editingEntry?.dueDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none font-black transition-all" 
                  />
                </div>
              </div>

              <div className="pt-10 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingEntry(null); }} 
                  className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-5 h-5" /> {editingEntry ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceModule;
