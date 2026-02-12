import React from 'react';

interface EmployeeDetailProps {
    employee: any;
    onClose: () => void;
}

const EmployeeDetailCard: React.FC<EmployeeDetailProps> = ({ employee, onClose }) => {
    if (!employee) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/60 relative overflow-hidden rounded-[2.5rem] p-10 shadow-[0_8px_32px_0_rgba(112,0,255,0.08)] animate-in fade-in zoom-in duration-300">
                {/* Neon Glow Border Effect */}
                <div className="absolute inset-[-1px] bg-gradient-to-br from-purple-500/40 to-cyan-400/40 -z-10 rounded-[2.5rem] pointer-events-none"></div>

                <div className="flex justify-between items-start mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl p-0.5 bg-gradient-to-tr from-[#7000ff] via-[#00d4ff] to-white shadow-xl">
                            <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white bg-slate-50 flex items-center justify-center">
                                {/* Using Material Icon as avatar placeholder if no image */}
                                <span className="material-icons text-5xl text-slate-300">person</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full border border-slate-100 shadow-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#7000ff] text-[18px] font-bold">verified</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="font-display font-black text-[#1e1e24] text-xl tracking-tighter">GADGET<span className="text-[#7000ff]">AN</span></span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{employee.role_category || 'Système de Gestion'}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-[10px] font-black px-2 py-0.5 rounded bg-[#7000ff] text-white tracking-widest uppercase shadow-md shadow-purple-200">
                            {employee.poste || 'Employé'}
                        </span>
                    </div>
                    <div className="flex items-end gap-3">
                        <h1 className="font-display text-3xl font-black text-[#1e1e24] leading-none uppercase tracking-tight">
                            {employee.prenom_employe} <br /> {employee.nom_employe}
                        </h1>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 block">Matricule</label>
                            <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-black text-[#7000ff]">ID-{employee.matricule_employe}</span>
                            </div>
                        </div>
                        <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 block">Catégorie</label>
                            <span className="font-display text-sm font-bold tracking-tight">{employee.role_category || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm flex items-center justify-between">
                        <div className="w-full">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 block">Email Professionnel</label>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500 text-sm">alternate_email</span>
                                <span className="font-display text-sm font-bold text-[#1e1e24] tracking-tight lowercase">{employee.email_employe}</span>
                            </div>
                        </div>
                    </div>

                    {employee.nom_superviseur && (
                        <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm flex items-center justify-between">
                            <div className="w-full">
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 block">Supérieur Hiérarchique</label>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500 text-sm">supervisor_account</span>
                                    <span className="font-display text-sm font-bold text-[#1e1e24] tracking-tight uppercase">{employee.nom_superviseur}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Signature Active</p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tight">CLE_ENCRYPT: 0x8F{employee.matricule_employe}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
                            {/* QR Code Placeholder pattern */}
                            <div className="w-full h-full opacity-40" style={{ backgroundImage: 'repeating-conic-gradient(#cbd5e1 0% 25%, transparent 0% 50%)', backgroundSize: '4px 4px' }}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-800 text-xl font-light">qr_code_2</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-10 w-16 h-1 bg-gradient-to-r from-transparent via-[#7000ff] to-transparent opacity-20"></div>
                <div className="absolute bottom-10 right-0 w-1 h-12 bg-gradient-to-b from-transparent via-[#00d4ff] to-transparent opacity-20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#7000ff]/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#00d4ff]/5 -ml-12 -mb-12 rounded-full blur-2xl"></div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors z-50">
                    <span className="material-icons">close</span>
                </button>
            </div>
        </div>
    );
};


export default EmployeeDetailCard;
