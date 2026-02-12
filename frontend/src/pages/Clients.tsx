import { useEffect, useState } from 'react';
import api from '../lib/axios';

interface Client {
    id_client: number;
    nom_client: string;
    prenom_client: string;
    email_client: string;
    contact_client: string;
    adresse_client: string;
}

const ClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nom_client: '',
        prenom_client: '',
        email_client: '',
        contact_client: '',
        adresse_client: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/clients', formData);
            fetchClients();
            setIsDrawerOpen(false);
            setFormData({
                nom_client: '',
                prenom_client: '',
                email_client: '',
                contact_client: '',
                adresse_client: ''
            });
            alert('Client enregistré avec succès !');
        } catch (error) {
            console.error('Error creating client:', error);
            alert("Erreur lors de l'enregistrement du client.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Toutes les ventes associées seront également supprimées.')) {
            try {
                await api.delete(`/clients/${id}`);
                fetchClients(); // Refresh list
                alert('Client supprimé avec succès.');
            } catch (error) {
                console.error('Error deleting client:', error);
                alert("Erreur lors de la suppression du client.");
            }
        }
    };

    return (
        <div className="flex p-8 gap-8 h-full overflow-hidden relative">
            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 flex flex-col ${isDrawerOpen ? 'mr-[400px]' : ''}`}>
                {/* Header Section */}
                <div className="flex justify-between items-end mb-8 flex-none">
                    <div>
                        <h2 className="font-orbitron text-3xl font-black text-slate-800 tracking-tight">RÉPERTOIRE CLIENTS</h2>
                        <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {clients.length} Profils Actifs Synchronisés
                        </p>
                    </div>
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-orbitron font-bold text-sm flex items-center gap-2 tracking-widest shadow-lg shadow-primary/30 transition-all active:transform active:scale-95"
                    >
                        <span className="material-icons text-lg">person_add</span>
                        AJOUTER UN CLIENT
                    </button>
                </div>

                {/* Stats Grid (Mock Data for Visuals) */}
                <div className="grid grid-cols-4 gap-6 mb-8 flex-none">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Total Clients</p>
                        <div className="flex items-end justify-between">
                            <h3 className="font-orbitron text-2xl font-bold text-slate-800">{clients.length}</h3>
                            <span className="text-green-500 text-xs font-bold mb-1">+12% ↑</span>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Fidélisation</p>
                        <div className="flex items-end justify-between">
                            <h3 className="font-orbitron text-2xl font-bold text-slate-800">68%</h3>
                            <span className="text-primary text-xs font-bold mb-1">Stable</span>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Valeur Moyenne</p>
                        <div className="flex items-end justify-between">
                            <h3 className="font-orbitron text-2xl font-bold text-slate-800">4.2k</h3>
                            <span className="text-green-500 text-xs font-bold mb-1">+5.4% ↑</span>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Profil Risque</p>
                        <div className="flex items-end justify-between">
                            <h3 className="font-orbitron text-2xl font-bold text-slate-800">2.1%</h3>
                            <span className="text-slate-400 text-xs font-bold mb-1">Faible</span>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-primary/10 shadow-sm flex-1 flex flex-col min-h-0">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-200 sticky top-0 backdrop-blur-md z-10">
                                <tr>
                                    <th className="px-6 py-4 font-orbitron text-[11px] uppercase tracking-widest text-slate-500">Identité Sujet</th>
                                    <th className="px-6 py-4 font-orbitron text-[11px] uppercase tracking-widest text-slate-500">Adresse mail</th>
                                    <th className="px-6 py-4 font-orbitron text-[11px] uppercase tracking-widest text-slate-500">Numero de téléphone</th>
                                    <th className="px-6 py-4 font-orbitron text-[11px] uppercase tracking-widest text-slate-500 text-right">Localisation</th>
                                    <th className="px-6 py-4 font-orbitron text-[11px] uppercase tracking-widest text-slate-500 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chargement des données...</td>
                                    </tr>
                                ) : clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Aucun client enregistré. Initialisez un nouveau profil.</td>
                                    </tr>
                                ) : (
                                    clients.map(client => (
                                        <tr key={client.id_client} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 border border-slate-300">
                                                        <span className="material-icons">person</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{client.nom_client} {client.prenom_client}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono tracking-tight">ID: #CLI-{client.id_client.toString().padStart(4, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600">{client.email_client}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono">
                                                    {client.contact_client}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-slate-700">{client.adresse_client}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleDelete(client.id_client)}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-all cursor-pointer border border-transparent"
                                                    >
                                                        <span className="material-icons text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sliding Drawer */}
            <aside className={`fixed right-0 top-0 h-screen w-[400px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-orbitron font-bold text-lg text-slate-800">ENREGISTREMENT</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Initialisation Nouveau Profil</p>
                    </div>
                    <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">


                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Nom</label>
                                <input
                                    name="nom_client"
                                    value={formData.nom_client}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium transition-all"
                                    placeholder="ex: Stark"
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Prénom</label>
                                <input
                                    name="prenom_client"
                                    value={formData.prenom_client}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium transition-all"
                                    placeholder="ex: Tony"
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Email / Neural ID</label>
                            <input
                                name="email_client"
                                value={formData.email_client}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-50 border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium transition-all"
                                placeholder="t.stark@industries.com"
                                type="email"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Contact (Tél)</label>
                            <input
                                name="contact_client"
                                value={formData.contact_client}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-50 border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium transition-all"
                                placeholder="+1 (555) 000-0000"
                                type="text"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Adresse Physique</label>
                            <input
                                name="adresse_client"
                                value={formData.adresse_client}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium transition-all"
                                placeholder="Malibu Point, 10880"
                                type="text"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-indigo-700 text-white py-4 rounded-xl font-orbitron font-bold text-sm flex items-center justify-center gap-2 tracking-[0.2em] shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
                        >
                            ENREGISTRER LE CLIENT
                        </button>
                    </form>
                </div>
            </aside>
        </div>
    );
};

export default ClientsPage;
