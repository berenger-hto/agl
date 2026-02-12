import { useEffect, useState } from 'react';
import api from '../lib/axios';

interface Gadget {
    id_gadget: number;
    nom_gadget: string;
    type_gadget: string;
    prix_vente_gadget: number;
    quantite_disponible: number;
    description_gadget?: string;
}

interface CartItem extends Gadget {
    quantity: number;
}

const SalesPage = () => {
    const [gadgets, setGadgets] = useState<Gadget[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const [clients, setClients] = useState<{ id_client: number, nom_client: string, prenom_client: string }[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');

    useEffect(() => {
        fetchGadgets();
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
            if (response.data.length > 0) {
                setSelectedClientId(response.data[0].id_client);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchGadgets = async () => {
        try {
            const response = await api.get('/gadgets');
            setGadgets(response.data);
        } catch (error) {
            console.error('Error fetching gadgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (gadget: Gadget) => {
        setCart(prev => {
            const existing = prev.find(item => item.id_gadget === gadget.id_gadget);
            if (existing) {
                return prev.map(item =>
                    item.id_gadget === gadget.id_gadget
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...gadget, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id_gadget !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id_gadget === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleCheckout = async () => {
        if (!selectedClientId) {
            alert('Veuillez sélectionner un client.');
            return;
        }
        setProcessing(true);
        try {
            await api.post('/sales', {
                id_client: Number(selectedClientId),
                items: cart.map(item => ({
                    id_gadget: item.id_gadget,
                    quantity: item.quantity
                }))
            });
            alert('Vente terminée avec succès !');
            setCart([]);
            fetchGadgets(); // Refresh stock
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Échec du paiement. Veuillez réessayer.');
        } finally {
            setProcessing(false);
        }
    };

    // Filter logic
    const categories = ['All', ...Array.from(new Set(gadgets.map(g => g.type_gadget)))];
    const filteredGadgets = gadgets.filter(g => {
        const matchesSearch = g.nom_gadget.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || g.type_gadget === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Totals
    const subtotal = cart.reduce((acc, item) => acc + (item.prix_vente_gadget * item.quantity), 0);
    const tax = subtotal * 0.18; // Example 18% tax
    const total = subtotal + tax;

    return (
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden bg-slate-100 rounded-3xl shadow-2xl border border-slate-200 font-sans">
            {/* Left Section: Product Grid */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">
                {/* Header */}
                <header className="h-20 flex-none bg-white border-b border-gray-200 flex items-center justify-between px-8 z-30 shadow-sm">
                    <div className="flex-1 max-w-xl mx-8 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <span className="material-icons text-xl">search</span>
                        </div>
                        <input
                            className="block w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium"
                            placeholder="Rechercher un gadget..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Categories */}
                <div className="px-8 pt-6 pb-2 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? 'bg-primary text-white shadow-primary/30'
                                    : 'bg-white text-slate-500 border border-gray-200 hover:border-primary/30 hover:text-slate-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 p-8 pt-4 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <span className="material-icons animate-spin text-4xl text-primary/30">refresh</span>
                        </div>
                    ) : filteredGadgets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <span className="material-icons text-6xl mb-4 text-slate-200">sentiment_dissatisfied</span>
                            <p>Aucun gadget trouvé</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredGadgets.map(gadget => (
                                <button
                                    key={gadget.id_gadget}
                                    onClick={() => addToCart(gadget)}
                                    className="group bg-white rounded-3xl p-4 border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden flex flex-col h-[320px]"
                                >
                                    <div className={`absolute top-4 right-4 z-10 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg ${gadget.quantite_disponible === 0 ? 'bg-red-500/90 shadow-red-500/20' :
                                        gadget.quantite_disponible <= 5 ? 'bg-orange-500/90 shadow-orange-500/20' :
                                            'bg-slate-900/90 shadow-slate-900/20'
                                        }`}>
                                        {gadget.quantite_disponible === 0 ? 'RUPTURE' :
                                            gadget.quantite_disponible <= 5 ? `FAIBLE STOCK: ${gadget.quantite_disponible}` :
                                                `STOCK: ${gadget.quantite_disponible}`}
                                    </div>

                                    <div className="aspect-square rounded-2xl bg-indigo-50 mb-4 overflow-hidden border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors relative">
                                        {/* Placeholder Icon/Gradient */}
                                        <span className="material-icons text-6xl text-indigo-300 group-hover:scale-110 transition-transform duration-500">
                                            {gadget.type_gadget.toLowerCase().includes('bot') ? 'smart_toy' :
                                                gadget.type_gadget.toLowerCase().includes('jouet') ? 'toys' :
                                                    gadget.type_gadget.toLowerCase().includes('montre') ? 'watch' : 'category'}
                                        </span>
                                    </div>

                                    <div className="px-1 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 truncate">{gadget.type_gadget}</p>
                                            <h3 className="font-extrabold text-slate-900 line-clamp-2 leading-tight mb-2">{gadget.nom_gadget}</h3>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xl font-black text-slate-900">
                                                {Number(gadget.prix_vente_gadget).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                            </span>
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center shadow-sm">
                                                <span className="material-icons text-xl">add</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section: Cart Sidebar */}
            <div className="w-[420px] flex-none flex flex-col bg-white border-l border-gray-200 z-40 shadow-xl shadow-slate-200/50">
                {/* Sidebar Header */}
                <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panier Actuel</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold">
                            {cart.reduce((acc, item) => acc + item.quantity, 0)} articles
                        </span>
                    </div>
                </div>

                {/* Client Selection */}
                <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Client
                    </label>
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(Number(e.target.value))}
                        className="w-full bg-white border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                        <option value="" disabled>Sélectionner un client</option>
                        {clients.map(client => (
                            <option key={client.id_client} value={client.id_client}>
                                {client.nom_client} {client.prenom_client}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <span className="material-icons text-4xl text-slate-400">shopping_basket</span>
                            </div>
                            <p className="text-sm font-bold text-slate-500">Votre panier est vide</p>
                            <p className="text-xs text-slate-400 mt-1">Ajoutez des gadgets pour commencer</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id_gadget} className="group flex gap-4 p-3 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all">
                                <div className="h-16 w-16 flex-none rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 border border-indigo-100">
                                    <span className="material-icons">confirmation_number</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.nom_gadget}</h4>
                                            <p className="text-[11px] text-slate-500 font-medium">Unité: {item.prix_vente_gadget.toLocaleString('fr-FR', { currency: 'XOF', style: 'currency' })}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id_gadget)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                            <span className="material-icons text-lg">close</span>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                                            <button onClick={() => updateQuantity(item.id_gadget, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:text-primary transition-colors disabled:opacity-50">
                                                <span className="material-icons text-xs">remove</span>
                                            </button>
                                            <span className="text-xs font-bold w-8 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id_gadget, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:text-primary transition-colors">
                                                <span className="material-icons text-xs">add</span>
                                            </button>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">
                                            {(item.prix_vente_gadget * item.quantity).toLocaleString('fr-FR', { currency: 'XOF', style: 'currency' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Totals */}
                <div className="p-6 bg-slate-50 border-t border-gray-200">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                            <span>Sous-total</span>
                            <span>{subtotal.toLocaleString('fr-FR', { currency: 'XOF', style: 'currency' })}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                            <span>TVA (18%)</span>
                            <span>{tax.toLocaleString('fr-FR', { currency: 'XOF', style: 'currency' })}</span>
                        </div>
                        <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-end">
                            <span className="text-xs font-extrabold text-slate-900 uppercase">Total à Payer</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                                {total.toLocaleString('fr-FR', { currency: 'XOF', style: 'currency' })}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        <button
                            onClick={() => setCart([])}
                            className="col-span-1 h-14 rounded-2xl border-2 border-gray-200 text-slate-400 hover:bg-white hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center"
                            title="Vider le panier"
                        >
                            <span className="material-icons">delete_outline</span>
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || processing}
                            className="col-span-3 h-14 rounded-2xl bg-primary hover:bg-indigo-700 text-white font-bold shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <span className="material-icons animate-spin">refresh</span>
                            ) : (
                                <span className="material-icons">payments</span>
                            )}
                            {processing ? 'Traitement...' : 'ENCAISSER'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesPage;
