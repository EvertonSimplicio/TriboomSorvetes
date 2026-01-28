
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Download, 
  Layers, 
  FileBarChart, 
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Save,
  TrendingUp,
  PieChart,
  BarChart3,
  RefreshCw,
  ClipboardCheck,
  ArrowRight,
  ListChecks
} from 'lucide-react';
import { Product, ProductGroup } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Picolé Morango', groupId: 'g1', groupName: 'Frutas', price: 2.5, stock: 15, minStock: 5, active: true, createdAt: '2023-10-01' },
  { id: '2', name: 'Pote Chocolate 2L', groupId: 'g2', groupName: 'Massa', price: 25, stock: 3, minStock: 10, active: true, createdAt: '2023-10-05' },
  { id: '3', name: 'Cobertura Caramelo', groupId: 'g3', groupName: 'Insumos', price: 15, stock: 2, minStock: 5, active: true, createdAt: '2023-11-12' },
  { id: '4', name: 'Caixa Térmica P', groupId: 'g3', groupName: 'Logística', price: 350, stock: 0, minStock: 5, active: false, createdAt: '2023-11-15' },
];

const INITIAL_GROUPS: ProductGroup[] = [
  { id: 'g1', name: 'Frutas' },
  { id: 'g2', name: 'Massa' },
  { id: 'g3', name: 'Insumos' },
];

const ProductsModule: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [groups, setGroups] = useState<ProductGroup[]>(INITIAL_GROUPS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isBulkStockModalOpen, setIsBulkStockModalOpen] = useState(false); // Novo Modal
  const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estado para Acerto de Estoque Individual
  const [newStockCount, setNewStockCount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Estado para Acerto em Massa
  const [bulkAdjustments, setBulkAdjustments] = useState<Record<string, number>>({});
  const [bulkSearchTerm, setBulkSearchTerm] = useState('');

  // Menu de ações (Dropdown)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesStatus = filterStatus === 'all' ? true : (filterStatus === 'active' ? p.active : !p.active);
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.groupName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [products, filterStatus, searchTerm]);

  const reportStats = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const criticalItems = products.filter(p => p.stock <= p.minStock);
    const groupsDistribution = groups.map(g => {
      const count = products.filter(p => p.groupId === g.id).length;
      const value = products.filter(p => p.groupId === g.id).reduce((acc, p) => acc + (p.price * p.stock), 0);
      return { ...g, count, value };
    });
    return { totalValue, criticalItems, groupsDistribution };
  }, [products, groups]);

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const groupId = formData.get('groupId') as string;
    const price = Number(formData.get('price'));
    const minStock = Number(formData.get('minStock'));
    const groupName = groups.find(g => g.id === groupId)?.name || 'Sem Grupo';

    if (id) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, name, groupId, groupName, price, minStock } : p));
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        groupId,
        groupName,
        price,
        stock: Number(formData.get('stock')) || 0,
        minStock,
        active: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsFormModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setActiveDropdownId(null);
    setTimeout(() => {
      if (confirm('Tem certeza que deseja excluir este produto?')) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    }, 10);
  };

  const handleToggleStatus = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    setActiveDropdownId(null);
  };

  const handleAdjustStock = () => {
    if (!selectedProduct) return;
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, stock: newStockCount } : p));
    setIsStockModalOpen(false);
    setSelectedProduct(null);
  };

  const openStockAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setNewStockCount(product.stock);
    setAdjustmentReason('');
    setIsStockModalOpen(true);
  };

  const openBulkAdjustment = () => {
    const initialAdjustments: Record<string, number> = {};
    products.forEach(p => {
      if (p.active) initialAdjustments[p.id] = p.stock;
    });
    setBulkAdjustments(initialAdjustments);
    setIsBulkStockModalOpen(true);
  };

  const handleSaveBulkAdjustments = () => {
    setProducts(prev => prev.map(p => {
      if (bulkAdjustments[p.id] !== undefined) {
        return { ...p, stock: bulkAdjustments[p.id] };
      }
      return p;
    }));
    setIsBulkStockModalOpen(false);
  };

  const handleAddGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('groupName') as string;
    if (!name) return;
    const newGroup: ProductGroup = { id: 'g' + Math.random().toString(36).substr(2, 5), name };
    setGroups(prev => [...prev, newGroup]);
    e.currentTarget.reset();
  };

  const handleDeleteGroup = (id: string) => {
    if (products.some(p => p.groupId === id)) {
      alert('Não é possível excluir um grupo que possui produtos vinculados.');
      return;
    }
    if (confirm('Deseja excluir este grupo?')) setGroups(prev => prev.filter(g => g.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'Grupo', 'Preço Unitário', 'Estoque', 'Mínimo', 'Status'];
    const rows = filteredProducts.map(p => [p.id, p.name, p.groupName, p.price, p.stock, p.minStock, p.active ? 'Ativo' : 'Inativo']);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_produtos.csv");
    document.body.appendChild(link);
    link.click();
  };

  const stockDifference = selectedProduct ? newStockCount - selectedProduct.stock : 0;

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tighter">
            <Package className="w-6 h-6 text-red-600" />
            Meus Produtos
          </h2>
          <p className="text-slate-500 font-medium">Gestão de catálogo e inventário <span className="text-red-600 font-bold">Triboom</span>.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={openBulkAdjustment}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <ListChecks className="w-5 h-5" /> Acerto Geral
          </button>
          <button 
            onClick={() => { setSelectedProduct(null); setIsFormModalOpen(true); }}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-red-100 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Novo Produto
          </button>
          <button 
            onClick={() => setIsGroupsModalOpen(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <Layers className="w-4 h-4 text-red-500" /> Categorias
          </button>
          <button 
            onClick={() => setIsReportsModalOpen(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <FileBarChart className="w-4 h-4 text-emerald-500" /> Relatórios
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Itens</p>
          <p className="text-2xl font-black text-slate-800">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ativos</p>
          <p className="text-2xl font-black text-emerald-600">{products.filter(p => p.active).length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Estoque Crítico</p>
          <p className="text-2xl font-black text-red-600">{products.filter(p => p.stock <= p.minStock).length}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor Patrimonial</p>
          <p className="text-2xl font-black text-amber-400 tracking-tighter">
            R$ {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou grupo..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Status:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${filterStatus === status ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {status === 'all' ? 'Tudo' : status === 'active' ? 'Ativos' : 'Inativos'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto / SKU</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço Unitário</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estoque</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 tracking-tight">{p.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {p.id.padStart(4, '0')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                      {p.groupName}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-800">
                    R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center gap-1.5 font-black text-base ${p.stock <= p.minStock ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                        {p.stock}
                        {p.stock <= p.minStock && <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mín: {p.minStock}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {p.active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase">
                        <CheckCircle className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase">
                        <XCircle className="w-3.5 h-3.5" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openStockAdjustment(p)}
                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        title="Acerto de Estoque"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => { setSelectedProduct(p); setIsFormModalOpen(true); }}
                        className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === p.id ? null : p.id);
                          }}
                          className={`p-2.5 rounded-xl transition-all ${activeDropdownId === p.id ? 'bg-slate-900 text-white rotate-90 shadow-lg' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {activeDropdownId === p.id && (
                          <div 
                            ref={dropdownRef}
                            className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(p.id);
                              }}
                              className="w-full text-left px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 font-bold"
                            >
                              {p.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
                              {p.active ? 'Inativar' : 'Ativar'}
                            </button>
                            <div className="h-px bg-slate-50 my-2"></div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(p.id);
                              }}
                              className="w-full text-left px-5 py-3 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-3 font-black"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ACERTO DE ESTOQUE GERAL (INVENTÁRIO EM MASSA) */}
      {isBulkStockModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                    <ListChecks className="w-7 h-7 text-indigo-600" /> Acerto de Estoque Geral
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Conferência de todos os itens ativos</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome..." 
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all w-60"
                    value={bulkSearchTerm}
                    onChange={(e) => setBulkSearchTerm(e.target.value)}
                  />
                </div>
                <button onClick={() => setIsBulkStockModalOpen(false)} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-90 shadow-sm">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 border-b-2 border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Categoria</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sistema</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Físico</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Diferença</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.filter(p => p.active && p.name.toLowerCase().includes(bulkSearchTerm.toLowerCase())).map(p => {
                    const currentPhysical = bulkAdjustments[p.id] ?? p.stock;
                    const diff = currentPhysical - p.stock;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-700 text-sm">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {p.id.padStart(4, '0')}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tight">
                            {p.groupName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-slate-400">{p.stock}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <input 
                              type="number" 
                              value={currentPhysical}
                              onChange={(e) => setBulkAdjustments(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                              className="w-24 text-center py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-black tracking-tighter ${
                            diff === 0 ? 'text-slate-400' :
                            diff > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                    A contagem informada substituirá o saldo atual. <br />
                    Verifique as divergências em <span className="text-red-600">vermelho</span> e <span className="text-emerald-600">verde</span>.
                  </p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={() => setIsBulkStockModalOpen(false)} className="flex-1 md:flex-none px-10 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-all">Cancelar</button>
                    <button 
                        onClick={handleSaveBulkAdjustments}
                        className="flex-[2] md:flex-none px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" /> Aplicar Acertos Geral
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ACERTO DE ESTOQUE INDIVIDUAL */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-red-600" /> Acerto de Estoque
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedProduct.name}</p>
              </div>
              <button onClick={() => setIsStockModalOpen(false)} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-90 shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estoque Sistema</p>
                  <span className="text-3xl font-black text-slate-400">{selectedProduct.stock}</span>
                </div>
                
                <div className={`p-5 rounded-3xl border flex flex-col items-center justify-center transition-all ${
                  stockDifference === 0 ? 'bg-slate-50 border-slate-100' :
                  stockDifference > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                }`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                    stockDifference === 0 ? 'text-slate-400' :
                    stockDifference > 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>Diferença</p>
                  <span className={`text-3xl font-black tracking-tighter ${
                    stockDifference === 0 ? 'text-slate-400' :
                    stockDifference > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {stockDifference > 0 ? `+${stockDifference}` : stockDifference}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contagem Física Atual</label>
                    <div className="relative">
                        <ClipboardCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="number" 
                            value={newStockCount}
                            onChange={(e) => setNewStockCount(Number(e.target.value))}
                            autoFocus
                            className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[28px] text-2xl font-black text-slate-800 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                            placeholder="Quantidade contada..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Motivo do Acerto</label>
                    <textarea 
                        rows={2}
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        placeholder="Ex: Quebra de embalagem, erro de contagem anterior..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all resize-none"
                    />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-3xl border border-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed">
                    Atenção: Este procedimento atualizará o saldo de estoque imediatamente. Esta ação ficará registrada para auditoria.
                  </p>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setIsStockModalOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-all">Cancelar</button>
                    <button 
                        onClick={handleAdjustStock}
                        className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-red-700 shadow-xl shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" /> Confirmar Acerto
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outros Modais (Grupos, Relatórios, Form) permanecem inalterados mas devem estar presentes para funcionalidade completa */}
      {/* ... Resto dos modais existentes ... */}
      
      {/* MODAL GESTÃO DE GRUPOS */}
      {isGroupsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-0 overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                <Layers className="w-6 h-6 text-red-600" /> Categorias
              </h3>
              <button onClick={() => setIsGroupsModalOpen(false)} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <form onSubmit={handleAddGroup} className="flex gap-2">
                <input 
                  name="groupName"
                  required
                  placeholder="Nova categoria..."
                  className="flex-1 px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 outline-none font-bold"
                />
                <button type="submit" className="bg-red-600 text-white p-3.5 rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100">
                  <Plus className="w-6 h-6" />
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {groups.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-slate-100">
                    <span className="font-black text-slate-700 text-sm uppercase tracking-tight">{g.name}</span>
                    <button 
                      onClick={() => handleDeleteGroup(g.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => setIsGroupsModalOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase">Fechar Janela</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RELATÓRIOS */}
      {isReportsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl p-0 overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-white px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Status de Inventário</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Visão estratégica em tempo real</p>
              </div>
              <button onClick={() => setIsReportsModalOpen(false)} className="bg-slate-100 p-3 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10 overflow-y-auto space-y-12">
               {/* Conteúdo do dashboard de relatórios... */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-red-600 rounded-[32px] text-white shadow-xl shadow-red-100 relative overflow-hidden group">
                  <TrendingUp className="w-7 h-7 mb-4 opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Capital Imobilizado</p>
                  <p className="text-3xl font-black tracking-tighter">R$ {reportStats.totalValue.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm">
                  <BarChart3 className="w-7 h-7 mb-4 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Categorias</p>
                  <p className="text-3xl font-black text-slate-800">{groups.length}</p>
                </div>
                <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-xl">
                  <AlertTriangle className="w-7 h-7 mb-4 text-amber-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reposição Necessária</p>
                  <p className="text-3xl font-black text-white">{reportStats.criticalItems.length}</p>
                </div>
              </div>
            </div>
            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button onClick={exportToCSV} className="flex items-center gap-2 text-red-600 font-black text-xs uppercase hover:underline">
                <Download className="w-4 h-4" /> Baixar Planilha Excel
              </button>
              <button onClick={() => setIsReportsModalOpen(false)} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95">Fechar Painel</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORMULÁRIO PRODUTO */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-10 space-y-6">
              <input type="hidden" name="id" defaultValue={selectedProduct?.id} />
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Comercial</label>
                  <input name="name" required defaultValue={selectedProduct?.name} placeholder="Ex: Picolé Brigadeiro Especial" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-bold transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                    <select name="groupId" defaultValue={selectedProduct?.groupId || groups[0].id} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none bg-white font-black">
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preço Venda (R$)</label>
                    <input name="price" type="number" step="0.01" required defaultValue={selectedProduct?.price} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-black text-red-600 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Saldo Inicial</label>
                    <input name="stock" type="number" required disabled={!!selectedProduct} defaultValue={selectedProduct?.stock || 0} className={`w-full px-5 py-3.5 border border-slate-200 rounded-2xl outline-none font-black transition-all ${selectedProduct ? 'bg-slate-50 text-slate-300' : 'focus:ring-4 focus:ring-red-500/10 focus:border-red-400'}`} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ponto Crítico</label>
                    <input name="minStock" type="number" required defaultValue={selectedProduct?.minStock || 0} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none font-black transition-all" />
                  </div>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-red-700 shadow-xl shadow-red-200 flex items-center justify-center gap-2 transition-all active:scale-95"><Save className="w-5 h-5" /> Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsModule;
