
import React from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string; // Admin, Gerente, Operador
}

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export interface ProductGroup {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
  price: number;
  stock: number;
  minStock: number;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  type: 'Cliente' | 'Fornecedor' | 'Ambos';
  document: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  active: boolean;
}

export interface Installment {
  number: number;
  dueDate: string;
  value: number;
}

export interface Invoice {
  id: string;
  number: string;
  series: string;
  supplierId: string;
  supplierName: string;
  issueDate: string;
  totalValue: number;
  status: 'Pendente' | 'Lançada' | 'Cancelada';
  hasFinance: boolean;
  installments: Installment[];
}

export interface FinanceEntry {
  id: string;
  description: string;
  type: 'Receita' | 'Despesa';
  category: string;
  value: number;
  dueDate: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  origin?: 'Nota Fiscal' | 'Manual' | 'Venda';
  entityName: string;
}

export interface CashierSession {
  id: string;
  date: string;
  shift: string | number;
  employeeName: string;
  shopName: string;
  amountCash: number;
  amountDebit: number;
  amountCredit: number;
  amountPix: number;
  total: number;
  notes?: string;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Gerente' | 'Operador';
  status: 'Ativo' | 'Inativo';
  lastAccess?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string; // Cargo
  department: string; // Setor
  status: 'Ativo' | 'Inativo' | 'Afastado';
  hireDate: string;
  userId?: string; // Vínculo com usuário do sistema
}

export interface Appointment {
  id: string;
  employeeId: string;
  date: string;
  isDayOff: boolean;
  entryTime?: string;
  intervalStart?: string;
  intervalEnd?: string;
  exitTime?: string;
  notes?: string;
  submittedAt: string;
}
