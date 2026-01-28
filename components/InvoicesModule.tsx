
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  X, 
  Save, 
  Calendar, 
  DollarSign, 
  FileCheck, 
  AlertCircle,
  ChevronRight,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Invoice, Installment } from '../types';

const INITIAL_INVOICES: Invoice[] = [
  { 
    id: '1', 
    number: '00012345', 
    series: '1', 
    supplierId: 's1', 
    supplierName: 'Tecnologia Avançada Ltda', 
    issueDate: '2023-10-25', 
    totalValue: 15400.50, 
    status: 'Lançada',
    hasFinance: true,
    installments: [
      { number: 1, dueDate: '2023-11-25', value: 7700.25 },
      { number: 2, dueDate: '2023-12-25', value: 7700.25 }
    ]
  },
  { 
    id: '2', 
    number: '00098712', 
    series: '1', 
    supplierId: 's2', 
    supplierName: 'Distribuidora Norte-Sul', 
    issueDate: '2023-11-02', 
    totalValue: 2100.00, 
    status: 'Pendente',
    hasFinance: false,
    installments: []
  },
];

const InvoicesModule: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Estados do formulário
  const [numInstallments, setNumInstallments] = useState(1);
  const [firstDueDate, setFirstDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatedInstallments, setGeneratedInstallments] = useState<Installment[]>([]);
  const [postToFinance, setPostToFinance] = useState(false);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => 
      inv.number.includes(searchTerm) || inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  // Simulação de Importação de XML
  const handleXMLImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsImporting(true);
    // Simula delay de processamento
    setTimeout(() => {
      const mockImport: Partial<Invoice> = {
        number: Math.floor(100000 + Math.random() * 900000).toString(),
        series: '1',
        supplierName: 'Fornecedor XML Exemplo S.A',
        issueDate: new Date().toISOString().split('T')[0],
        totalValue: 3500.80
      };
      
      // Abre o modal com os dados preenchidos
      setPostToFinance(true);
      calculateInstallments(3500.80, 1, new Date().toISOString().split('T')[0]);
      setIsImporting(false);
      setIsModalOpen(true);
      
      // Aqui em um cenário real preencheríamos o formik/state do form
      alert("XML Processado com sucesso! Verifique os dados no formulário.");
    }, 1500);
  };

  const calculateInstallments = (total: number, count: number, start: string) => {
    const installments: Installment[] = [];
    const valPerPart = total / count;
    let baseDate = new Date(start);

    for (let i = 1; i <= count; i++) {
      installments.push({
        number: i,
        dueDate: baseDate.toISOString().split('T')[0],
        value: valPerPart
      });
      baseDate.setMonth(baseDate.getMonth() + 1);
    }
    setGeneratedInstallments(installments);
  };

  const handleSaveInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      number: formData.get('number') as string,
      series: formData.get('series') as string,
      supplierId: 'manual',
      supplierName: formData.get('supplierName') as string,
      issueDate: formData.get('issueDate') as string,
      totalValue: Number(formData.get('totalValue')),
      status: postToFinance ? 'Lançada' : 'Pendente',
      hasFinance: postToFinance,
      installments: postToFinance ? generatedInstallments : []
    };

    setInvoices([newInvoice, ...invoices]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNumInstallments(1);
    setGeneratedInstallments([]);
    setPostToFinance(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Notas Fiscais de Entrada
          </h2>
          <p className="text-slate-500">Gerencie a entrada de mercadorias e integração financeira.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            {isImporting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-emerald-600"></span>
            ) : <Upload className="w-4 h-4" />}
            Importar XML
            <input type="file" accept=".xml" className="hidden" onChange={handleXMLImport} disabled={isImporting} />
          </label>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Lançar Manualmente
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por número da nota ou fornecedor..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Notas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NF-e / Série</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Emissão</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Financeiro</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{inv.number}</span>
                      <span className="text-xs text-slate-400">Série: {inv.series}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{inv.supplierName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.issueDate).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    R$ {inv.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {inv.hasFinance ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold" title="Lançado no Contas a Pagar">
                        <FileCheck className="w-4 h-4" /> Integrado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <ArrowRight className="w-4 h-4" /> Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                      inv.status === 'Lançada' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-0 overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800">Lançamento de Nota Fiscal</h3>
                <p className="text-sm text-slate-500">Insira os dados da nota e configure o financeiro</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Seção Dados da Nota */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Dados Básicos da Nota
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Fornecedor</label>
                    <input name="supplierName" required placeholder="Nome do fornecedor..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Número NF-e</label>
                    <input name="number" required placeholder="000.000.000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Série</label>
                    <input name="series" required placeholder="1" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Data Emissão</label>
                    <input name="issueDate" type="date" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Valor Total (R$)</label>
                    <input 
                      name="totalValue" 
                      type="number" 
                      step="0.01" 
                      required 
                      onChange={(e) => {
                        if (postToFinance) calculateInstallments(Number(e.target.value), numInstallments, firstDueDate);
                      }}
                      id="total-value-input"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700" 
                    />
                  </div>
                </div>
              </div>

              {/* Seção Financeiro */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Integração com Contas a Pagar
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={postToFinance} onChange={(e) => setPostToFinance(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-3 text-sm font-bold text-slate-700">Lançar no Financeiro</span>
                  </label>
                </div>

                {postToFinance && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nº de Parcelas</label>
                        <select 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                          value={numInstallments}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            setNumInstallments(n);
                            const total = Number((document.getElementById('total-value-input') as HTMLInputElement).value);
                            calculateInstallments(total, n, firstDueDate);
                          }}
                        >
                          {[1,2,3,4,5,6,10,12].map(n => <option key={n} value={n}>{n}x</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Primeiro Vencimento</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                          value={firstDueDate}
                          onChange={(e) => {
                            setFirstDueDate(e.target.value);
                            const total = Number((document.getElementById('total-value-input') as HTMLInputElement).value);
                            calculateInstallments(total, numInstallments, e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <p className="text-xs font-bold text-slate-400">Projeção de Parcelas</p>
                      <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y">
                        {generatedInstallments.map((inst) => (
                          <div key={inst.number} className="flex items-center justify-between p-3 text-sm">
                            <span className="font-bold text-slate-500">{inst.number}ª Parcela</span>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1 text-slate-600"><Calendar className="w-3 h-3" /> {new Date(inst.dueDate).toLocaleDateString('pt-BR')}</span>
                              <span className="font-black text-slate-800">R$ {inst.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-5 h-5" /> Finalizar Entrada de Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesModule;
