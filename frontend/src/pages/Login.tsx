import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.user);
            navigate('/');
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.response?.data?.error || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-8 md:p-12 w-full max-w-md relative z-10">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6">
                        <span className="material-icons text-white text-3xl">dataset</span>
                    </div>
                    <h1 className="font-display font-bold text-2xl text-slate-900">Bon retour</h1>
                    <p className="text-slate-500 mt-2">Connectez-vous pour accéder à votre tableau de bord.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-3 rounded-xl flex items-center">
                        <span className="material-icons mr-2 text-base">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Adresse E-mail</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-slate-400">email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mot de passe</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-slate-400">lock</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50" />
                            <span className="ml-2 text-sm text-slate-500 font-medium">Se souvenir de moi</span>
                        </label>
                        <a href="#" className="text-sm font-bold text-primary hover:underline">Mot de passe oublié ?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center disabled:opacity-70"
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                        {!loading && <span className="material-icons ml-2 text-lg">arrow_forward</span>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
