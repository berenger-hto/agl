import { useEffect, useState } from 'react';
import api from '../lib/axios';

interface Production {
    id_production: number;
    date_production: string;
    quantite_produite: number;
    id_gadget: number;
    nom_gadget?: string;
    type_gadget?: string;
    agent_names?: string;
    agent_firstnames?: string;
    agent_count?: number;
}

interface Gadget {
    id_gadget: number;
    nom_gadget: string;
}

interface Employee {
    matricule_employe: number;
    nom_employe: string;
    prenom_employe: string;
    poste: string;
    role_category?: string;
}

const ProductionPage = () => {
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
    const [loading, setLoading] = useState(false);

    // Data lists
    const [productions, setProductions] = useState<Production[]>([]);
    const [gadgets, setGadgets] = useState<Gadget[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        id_gadget: 0,
        date_production: new Date().toISOString().split('T')[0],
        quantite_produite: 100,
        priority: 'NORMAL',
        agents: [] as number[]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [gadgetRes, empRes, prodRes] = await Promise.all([
                api.get('/stocks'), // Assuming stocks endpoint returns gadgets info or check if separate gadget endpoint exists
                api.get('/employees'),
                api.get('/productions')
            ]);

            // Map stocks to unique gadgets if needed, or use gadget endpoint if available.
            // Based on previous code: api.get('/stocks') returning { id_gadget, nom_gadget }
            setGadgets(gadgetRes.data.map((s: any) => ({ id_gadget: s.id_gadget, nom_gadget: s.nom_gadget })));
            setEmployees(empRes.data);
            setProductions(prodRes.data);
        } catch (e) {
            console.error("Error fetching data", e);
        }
    };

    const handleAgentToggle = (id: number) => {
        setFormData(prev => {
            if (prev.agents.includes(id)) {
                return { ...prev, agents: prev.agents.filter(a => a !== id) };
            } else {
                return { ...prev, agents: [...prev.agents, id] };
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/productions', {
                date_production: formData.date_production,
                quantite_produite: formData.quantite_produite,
                id_gadget: formData.id_gadget,
                agents: formData.agents
            });
            alert('Production lancée avec succès !');
            // Reset or redirect?
            setStep(1);
            setFormData({
                id_gadget: 0,
                date_production: new Date().toISOString().split('T')[0],
                quantite_produite: 100,
                priority: 'NORMAL',
                agents: []
            });
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la création de la production");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && (!formData.id_gadget || !formData.date_production)) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
        }
        if (step === 2 && formData.agents.length === 0) {
            if (!confirm("Aucun agent sélectionné. Continuer ?")) return;
        }
        setStep(p => Math.min(p + 1, 3));
    };

    const prevStep = () => setStep(p => Math.max(p - 1, 1));

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-background-light">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10 shrink-0">
                <div className="flex items-center gap-8">
                    <h2 className="text-xl font-bold text-slate-800">Contrôle de Production</h2>
                    <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Nouveau
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Liste
                        </button>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary/10 bg-primary/5">Système : En ligne</span>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {activeTab === 'new' && (
                    /* Stepper Content */
                    <div className="mx-auto max-w-4xl bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="p-8 pb-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-orbitron text-2xl font-bold tracking-tight text-slate-900">NOUVEAU CYCLE DE PRODUCTION</h2>
                            </div>

                            {/* Stepper Indicator */}
                            <div className="relative flex items-center justify-between px-12">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                                <div
                                    className="absolute top-1/2 left-0 h-0.5 stepper-line -translate-y-1/2 z-0 transition-all duration-500"
                                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                                ></div>

                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ring-8 ring-white transition-all duration-300 ${step >= s ? 'bg-primary text-white shadow-lg' : 'bg-white border-2 border-gray-200 text-slate-400 shadow-sm'
                                            }`}>
                                            <span className="material-icons">
                                                {s === 1 ? 'settings' : s === 2 ? 'precision_manufacturing' : 'verified'}
                                            </span>
                                        </div>
                                        <span className={`mt-2 font-orbitron text-[10px] font-bold uppercase tracking-tighter ${step >= s ? 'text-primary' : 'text-slate-400'
                                            }`}>
                                            {s === 1 ? '01 : Détails' : s === 2 ? '02 : Agents' : '03 : Confirmer'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 p-10 min-h-[400px]">
                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                                <span className="material-icons text-[18px] mr-2">devices</span>
                                                Sélection du Gadget
                                            </label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-white border-gray-200 rounded-xl py-3 pl-4 pr-10 text-slate-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all outline-none"
                                                    value={formData.id_gadget}
                                                    onChange={(e) => setFormData({ ...formData, id_gadget: Number(e.target.value) })}
                                                >
                                                    <option value={0}>Sélectionner un gadget</option>
                                                    {gadgets.map(g => (
                                                        <option key={g.id_gadget} value={g.id_gadget}>{g.nom_gadget}</option>
                                                    ))}
                                                </select>
                                                <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                                <span className="material-icons text-[18px] mr-2">calendar_today</span>
                                                Date de Début
                                            </label>
                                            <input
                                                className="w-full bg-white border-gray-200 rounded-xl py-3 px-4 text-slate-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                type="date"
                                                value={formData.date_production}
                                                onChange={(e) => setFormData({ ...formData, date_production: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                                <span className="material-icons text-[18px] mr-2">priority_high</span>
                                                Niveau de Priorité
                                            </label>
                                            <div className="flex gap-3">
                                                {['NORMAL', 'HAUT', 'CRITIQUE'].map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, priority: p })}
                                                        className={`flex-1 py-2 px-4 rounded-lg border-2 text-xs font-bold transition-all ${formData.priority === p
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-100 text-slate-400 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                                    <span className="material-icons text-[18px] mr-2">layers</span>
                                                    Quantité de Production
                                                </label>
                                                <span className="text-2xl font-orbitron font-black text-primary">{formData.quantite_produite.toLocaleString()}</span>
                                            </div>
                                            <div className="pt-2">
                                                <input
                                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer custom-range"
                                                    type="range"
                                                    min="10"
                                                    max="5000"
                                                    step="10"
                                                    value={formData.quantite_produite}
                                                    onChange={(e) => setFormData({ ...formData, quantite_produite: Number(e.target.value) })}
                                                />
                                                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                                                    <span>MIN : 10</span>
                                                    <span>MAX : 5,000</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-slate-800">Assigner des Agents</h3>
                                        <span className="text-sm text-slate-500">{formData.agents.length} sélectionnés</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                        {employees.filter(e => e.role_category === 'Agent').map(emp => (
                                            <div
                                                key={emp.matricule_employe}
                                                onClick={() => handleAgentToggle(emp.matricule_employe)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.agents.includes(emp.matricule_employe)
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden ${formData.agents.includes(emp.matricule_employe) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {emp.nom_employe.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-bold ${formData.agents.includes(emp.matricule_employe) ? 'text-primary' : 'text-slate-700'}`}>
                                                            {emp.nom_employe} {emp.prenom_employe.split(' ')[0]}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{emp.poste || 'Employé'}</p>
                                                    </div>
                                                    {formData.agents.includes(emp.matricule_employe) && (
                                                        <span className="material-icons text-primary ml-auto">check_circle</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {employees.filter(e => e.role_category === 'Agent').length === 0 && (
                                            <div className="col-span-full text-center py-8 text-slate-500">
                                                Aucun agent de production trouvé.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="material-icons text-3xl text-primary">analytics</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Confirmer la Production</h3>
                                        <p className="text-slate-500">Veuillez vérifier les détails avant de lancer le cycle de production.</p>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-200 border-dashed">
                                            <span className="text-sm font-medium text-slate-500">Gadget</span>
                                            <span className="text-sm font-bold text-slate-900">{gadgets.find(g => g.id_gadget === formData.id_gadget)?.nom_gadget || 'Inconnu'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-200 border-dashed">
                                            <span className="text-sm font-medium text-slate-500">Quantité</span>
                                            <span className="text-sm font-bold text-slate-900">{formData.quantite_produite} Unités</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-200 border-dashed">
                                            <span className="text-sm font-medium text-slate-500">Agents Assignés</span>
                                            <span className="text-sm font-bold text-slate-900">{formData.agents.length} Agents</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm font-medium text-slate-500">Date de Début</span>
                                            <span className="text-sm font-bold text-slate-900">{new Date(formData.date_production).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-gray-100 bg-white/50 flex items-center justify-between">
                            {step > 1 ? (
                                <button
                                    onClick={prevStep}
                                    className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest flex items-center"
                                >
                                    <span className="material-icons mr-2 text-base">arrow_back</span>
                                    Retour
                                </button>
                            ) : (
                                <div className="w-24"></div> // Spacer
                            )}

                            <div className="flex space-x-4">
                                {step < 3 ? (
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-3.5 rounded-xl text-sm font-bold neon-button text-slate-900 uppercase tracking-widest flex items-center font-orbitron"
                                    >
                                        Suivant
                                        <span className="material-icons ml-2 text-base">arrow_forward</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-8 py-3.5 rounded-xl text-sm font-bold bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/30 transition-all uppercase tracking-widest flex items-center font-orbitron disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Traitement...' : 'Lancer la Production'}
                                        <span className="material-icons ml-2 text-base">rocket_launch</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'list' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-12 gap-4 px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200 bg-slate-50/50 backdrop-blur-md sticky top-0 z-20 rounded-t-xl">
                            <div className="col-span-2">Date</div>
                            <div className="col-span-1">ID</div>
                            <div className="col-span-3">Gadget</div>
                            <div className="col-span-2">Quantité</div>
                            <div className="col-span-2">Agents Actifs</div>
                            <div className="col-span-1">Statut</div>
                            <div className="col-span-1 text-right">Options</div>
                        </div>
                        <div className="space-y-3 mt-4 pb-8">
                            {productions.map((prod) => (
                                <div key={prod.id_production} className="glass-panel bg-white/40 grid grid-cols-12 gap-4 px-8 py-5 items-center rounded-xl transition-all hover:bg-white/60 hover:shadow-md border border-white/50">
                                    <div className="col-span-2">
                                        <p className="text-xs font-mono font-bold text-slate-900">
                                            {new Date(prod.date_production).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            #{prod.id_production}
                                        </span>
                                    </div>
                                    <div className="col-span-3 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm">
                                            <span className="material-icons text-xl neon-text-glow">precision_manufacturing</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{prod.nom_gadget || 'Inconnu'}</p>
                                            <p className="text-[10px] font-bold text-cyan-600 tracking-wider uppercase">{prod.type_gadget || 'Standard'}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black bg-slate-900 text-white shadow-sm">
                                            +{prod.quantite_produite} UNITÉS
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex -space-x-3">
                                        {prod.agent_names ? (
                                            prod.agent_names.split(',').slice(0, 3).map((name, i) => (
                                                <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-50" title={name}>
                                                    {name.charAt(0)}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Aucun agent</span>
                                        )}
                                        {(prod.agent_count || 0) > 3 && (
                                            <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-black shadow-sm">
                                                +{(prod.agent_count || 0) - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-1">
                                        <div className="flex items-center gap-2">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white"></span>
                                            </span>
                                            <span className="text-[11px] font-black text-green-600 uppercase">Terminé</span>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button className="text-slate-300 hover:text-primary transition-colors">
                                            <span className="material-icons">more_horiz</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductionPage;
