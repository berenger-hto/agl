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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Ajouter un employé</h3>
                        <form onSubmit={handleCreateEmployee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Prénom</label>
                                <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newEmp.prenom_employe} onChange={e => setNewEmp({ ...newEmp, prenom_employe: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nom</label>
                                <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newEmp.nom_employe} onChange={e => setNewEmp({ ...newEmp, nom_employe: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                <input type="email" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newEmp.email_employe} onChange={e => setNewEmp({ ...newEmp, email_employe: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Rôle</label>
                                <select required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                    value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}>
                                    <option value="Employe">Employé Standard</option>
                                    <option value="Caissier">Caissier</option>
                                    <option value="Agent">Agent de Production</option>
                                    <option value="Admin">Administrateur</option>
                                </select>
                            </div>

                            {newEmp.role === 'Caissier' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Statut</label>
                                        <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                            value={newEmp.statut_caissier} onChange={e => setNewEmp({ ...newEmp, statut_caissier: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Code d'accès</label>
                                        <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                            value={newEmp.code_acces} onChange={e => setNewEmp({ ...newEmp, code_acces: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {newEmp.role === 'Agent' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Poste / Rôle</label>
                                    <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                        value={newEmp.role_agent} onChange={e => setNewEmp({ ...newEmp, role_agent: e.target.value })} />
                                </div>
                            )}

                            {newEmp.role === 'Admin' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Poste Administratif</label>
                                    <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2"
                                        value={newEmp.poste_administratif} onChange={e => setNewEmp({ ...newEmp, poste_administratif: e.target.value })} />
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl">Annuler</button>
                                <button type="submit" className="flex-1 bg-primary text-white font-bold py-2 rounded-xl">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRPage;
