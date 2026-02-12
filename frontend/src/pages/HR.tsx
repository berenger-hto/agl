import { useEffect, useState } from 'react';
import api from '../lib/axios';
import OrgChart from '../components/OrgChart';

interface Employee {
    matricule_employe: number;
    nom_employe: string;
    prenom_employe: string;
    email_employe: string;
    poste?: string; // Derived from joined tables (Caissier, Administratif, Agent)
    children?: Employee[];
}

const HRPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [hierarchy, setHierarchy] = useState<Employee[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newEmp, setNewEmp] = useState({
        nom_employe: '', prenom_employe: '', email_employe: '', role: 'Employe',
        statut_caissier: 'Actif', code_acces: '', role_agent: 'Ouvrier', poste_administratif: 'Staff'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [listRes, treeRes] = await Promise.all([
                api.get('/employees'),
                api.get('/employees?format=tree')
            ]);
            setEmployees(listRes.data);
            setHierarchy(treeRes.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/employees', newEmp);
            setShowModal(false);
            fetchData();
            alert('Employé ajouté !');
        } catch (e) { alert('Erreur ajout employé'); }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.')) {
            try {
                await api.delete(`/employees/${id}`);
                fetchData();
                alert('Employé supprimé avec succès.');
            } catch (error) {
                console.error('Error deleting employee:', error);
                alert("Erreur lors de la suppression de l'employé.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Personnel</h2>
                    <p className="text-slate-500">Gérez votre main-d'œuvre.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="bg-slate-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <span className="material-icons text-base align-middle mr-1">list</span> Liste
                        </button>
                    </div>
                    <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20">
                        <span className="material-icons align-middle mr-1">person_add</span> Ajouter
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-400">Chargement du personnel...</div>
            ) : (
                <>
                    {viewMode === 'tree' && (
                        <div className="mb-8">
                            <OrgChart data={hierarchy} />
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {employees.map((emp) => (
                                <div key={emp.matricule_employe} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(emp.matricule_employe);
                                        }}
                                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors z-20"
                                        title="Supprimer"
                                    >
                                        <span className="material-icons text-lg">delete</span>
                                    </button>
                                    <div className="flex items-start space-x-4 relative z-10">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold uppercase">
                                            {emp.prenom_employe[0]}{emp.nom_employe[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">{emp.prenom_employe} {emp.nom_employe}</h3>
                                            <p className="text-primary text-sm font-medium mb-1">{emp.poste || 'Employé'}</p>
                                            <p className="text-slate-400 text-xs flex items-center">
                                                <span className="material-icons text-[14px] mr-1">email</span> {emp.email_employe}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-display font-bold text-slate-900">Nouveau Membre</h3>
                                <p className="text-slate-500 text-sm">Ajouter un collaborateur à l'équipe</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateEmployee} className="space-y-6">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Prénom</label>
                                    <input type="text" required placeholder="Ex: Jean"
                                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3 text-slate-700 font-medium transition-all outline-none"
                                        value={newEmp.prenom_employe} onChange={e => setNewEmp({ ...newEmp, prenom_employe: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nom</label>
                                    <input type="text" required placeholder="Ex: Dupont"
                                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3 text-slate-700 font-medium transition-all outline-none"
                                        value={newEmp.nom_employe} onChange={e => setNewEmp({ ...newEmp, nom_employe: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Professionnel</label>
                                <div className="relative">
                                    <span className="material-icons absolute left-4 top-3.5 text-slate-400 text-[20px]">email</span>
                                    <input type="email" required placeholder="jean.dupont@gadgetan.com"
                                        className="w-full pl-11 bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3 text-slate-700 font-medium transition-all outline-none"
                                        value={newEmp.email_employe} onChange={e => setNewEmp({ ...newEmp, email_employe: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Rôle & Permissions</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Employe', 'Agent', 'Caissier', 'Admin'].map((roleOption) => (
                                        <div key={roleOption}
                                            onClick={() => setNewEmp({ ...newEmp, role: roleOption })}
                                            className={`cursor-pointer rounded-2xl p-3 border-2 transition-all flex items-center gap-3 ${newEmp.role === roleOption
                                                ? 'border-primary bg-primary/5'
                                                : 'border-transparent bg-slate-50 hover:bg-slate-100'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newEmp.role === roleOption ? 'border-primary' : 'border-slate-300'}`}>
                                                {newEmp.role === roleOption && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <span className={`text-sm font-bold ${newEmp.role === roleOption ? 'text-primary' : 'text-slate-600'}`}>
                                                {roleOption === 'Employe' ? 'Standard' : roleOption}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {newEmp.role === 'Caissier' && (
                                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h4 className="flex items-center text-orange-800 font-bold text-sm">
                                        <span className="material-icons text-base mr-2">point_of_sale</span>
                                        Configuration Caisse
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-orange-600/70 uppercase">Code d'accès</label>
                                            <input type="text" required placeholder="1234"
                                                className="w-full bg-white border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl px-3 py-2 text-slate-700 font-bold transition-all outline-none"
                                                value={newEmp.code_acces} onChange={e => setNewEmp({ ...newEmp, code_acces: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-orange-600/70 uppercase">Statut</label>
                                            <select className="w-full bg-white border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl px-3 py-2 text-slate-700 font-medium outline-none"
                                                value={newEmp.statut_caissier} onChange={e => setNewEmp({ ...newEmp, statut_caissier: e.target.value })}>
                                                <option value="Actif">Actif</option>
                                                <option value="Inactif">Inactif</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {newEmp.role === 'Agent' && (
                                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h4 className="flex items-center text-blue-800 font-bold text-sm">
                                        <span className="material-icons text-base mr-2">engineering</span>
                                        Détails de Production
                                    </h4>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-blue-600/70 uppercase">Spécialité / Poste</label>
                                        <input type="text" required placeholder="Ex: Assembleur, Technicien"
                                            className="w-full bg-white border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl px-3 py-2 text-slate-700 font-medium transition-all outline-none"
                                            value={newEmp.role_agent} onChange={e => setNewEmp({ ...newEmp, role_agent: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {newEmp.role === 'Admin' && (
                                <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h4 className="flex items-center text-purple-800 font-bold text-sm">
                                        <span className="material-icons text-base mr-2">admin_panel_settings</span>
                                        Administration
                                    </h4>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-purple-600/70 uppercase">Poste Administratif</label>
                                        <input type="text" required placeholder="Ex: DRH, Comptable"
                                            className="w-full bg-white border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 rounded-xl px-3 py-2 text-slate-700 font-medium transition-all outline-none"
                                            value={newEmp.poste_administratif} onChange={e => setNewEmp({ ...newEmp, poste_administratif: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl transition-all">
                                    Annuler
                                </button>
                                <button type="submit"
                                    className="flex-1 bg-primary hover:bg-primary-light text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                                    Créer le profil
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div >
    );
};

export default HRPage;
