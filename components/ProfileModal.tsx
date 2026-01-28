
import React, { useState, useRef } from 'react';
import { X, Camera, Lock, Save, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatarUrl);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...user,
      name,
      avatarUrl: avatarPreview
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-in zoom-in duration-200">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800">Meu Perfil</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden ring-4 ring-white shadow-xl transition-transform group-hover:scale-105">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-indigo-700 transition-all transform active:scale-90"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Toque para alterar foto</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">E-mail</label>
              <input 
                type="email" 
                value={user.email} 
                disabled 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 outline-none cursor-not-allowed"
              />
            </div>

            <button 
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Lock className="w-4 h-4" />
              {showPasswordFields ? 'Cancelar alteração de senha' : 'Alterar minha senha'}
            </button>

            {showPasswordFields && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 pt-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSuccess}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 ${isSuccess ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                  Perfil Atualizado!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
