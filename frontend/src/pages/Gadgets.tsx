import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface Gadget {
    id_gadget: number;
    nom_gadget: string;
    type_gadget: string;
    prix_vente_gadget: number;
    description_gadget: string;
    quantite_disponible?: number;
}

const GadgetsPage = () => {
    const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
    const [gadgets, setGadgets] = useState<Gadget[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom_gadget: '',
        type_gadget: '',
        prix_vente_gadget: 0,
        description_gadget: ''
    });

    const fetchGadgets = async () => {
        try {
            const res = await api.get('/gadgets');
            setGadgets(res.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des gadgets", error);
        }
    };

    useEffect(() => {
        fetchGadgets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/gadgets', formData);
            // Reset form and switch to list
            setFormData({
                nom_gadget: '',
                type_gadget: '',
                prix_vente_gadget: 0,
                description_gadget: ''
            });
            await fetchGadgets();
            setActiveTab('list');
            alert('Gadget ajouté avec succès !');
        } catch (error) {
            console.error("Erreur lors de la création du gadget", error);
            alert("Erreur lors de l'ajout du gadget.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-slate-50 z-0 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10 shrink-0">
                <div className="flex items-center gap-8">
                    <h2 className="text-xl font-bold text-slate-800">Gestion des Gadgets</h2>
                    <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Liste
                        </button>
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Nouveau
                        </button>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary/10 bg-primary/5">Système : En ligne</span>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar z-10">

                {activeTab === 'list' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Stats Cards based on template */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-primary">
                                        <span className="material-icons-outlined">inventory_2</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-lg">+12%</span>
                                </div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Gadgets</p>
                                <h3 className="text-2xl font-bold">{gadgets.length}</h3>
                            </div>
                            {/* More mock stats can be added here */}
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h4 className="font-bold text-lg text-slate-800">Inventaire</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                                            <th className="px-8 py-5">Nom du Gadget</th>
                                            <th className="px-6 py-5">Type</th>
                                            <th className="px-6 py-5 text-right">Prix</th>
                                            <th className="px-6 py-5 text-right">Stock</th>
                                            <th className="px-6 py-5">Description</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {gadgets.map((gadget) => (
                                            <tr key={gadget.id_gadget} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-primary font-bold">
                                                            <span className="material-icons">pets</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{gadget.nom_gadget}</p>
                                                            <p className="text-xs text-slate-400">ID: {gadget.id_gadget}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full uppercase tracking-tight">
                                                        {gadget.type_gadget}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right font-medium text-slate-700">
                                                    {Number(gadget.prix_vente_gadget).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-slate-800">{gadget.quantite_disponible || 0}</span>
                                                        <span className="text-[10px] text-slate-400">Unités</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 max-w-xs">
                                                    <p className="text-sm text-slate-500 truncate">{gadget.description_gadget}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded-lg transition-all">
                                                        <span className="material-icons-outlined text-slate-400">edit</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {gadgets.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-10 text-center text-slate-500">
                                                    Aucun gadget trouvé. Commencez par en ajouter un.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'new' && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900">Ajouter un Nouveau Gadget</h2>
                            <p className="text-slate-500 mt-1">Configurez et enregistrez une nouvelle unité de fabrication dans l'écosystème.</p>
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="nom_gadget">Nom du Gadget</label>
                                    <input
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400"
                                        id="nom_gadget"
                                        type="text"
                                        placeholder="Ex: Nounours"
                                        value={formData.nom_gadget}
                                        onChange={(e) => setFormData({ ...formData, nom_gadget: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700" htmlFor="type_gadget">Type de Gadget</label>
                                        <div className="relative">
                                            {/* Changed to input as requested by user "Le type du gadget doit être saisi par l'utilisateur directement" */}
                                            <input
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400"
                                                id="type_gadget"
                                                type="text"
                                                placeholder="Ex: Jouet, etc"
                                                value={formData.type_gadget}
                                                onChange={(e) => setFormData({ ...formData, type_gadget: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700" htmlFor="prix_vente_gadget">Prix Unitaire</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-medium">F</span>
                                            <input
                                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400"
                                                id="prix_vente_gadget"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.prix_vente_gadget}
                                                onChange={(e) => setFormData({ ...formData, prix_vente_gadget: parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="description_gadget">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400"
                                        id="description_gadget"
                                        rows={5}
                                        placeholder="Décrivez les spécifications du gadget..."
                                        value={formData.description_gadget}
                                        onChange={(e) => setFormData({ ...formData, description_gadget: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-4 border-t border-slate-100 pt-8">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('list')}
                                        className="w-full sm:w-auto px-8 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-icons-outlined mr-2 text-xl">add_circle_outline</span>
                                        {loading ? 'Création...' : 'Créer le Gadget'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GadgetsPage;
