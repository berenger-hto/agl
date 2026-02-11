import { useEffect, useState } from 'react';
import api from '../lib/axios';

interface Employee {
    matricule_employe: number;
    nom_employe: string;
    prenom_employe: string;
    email_employe: string;
    poste?: string; // Derived from joined tables (Caissier, Administratif, Agent)
}

const HRPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Personnel</h2>
                    <p className="text-slate-500">Manage your workforce.</p>
                </div>
                <button className="bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20">
                    <span className="material-icons align-middle mr-1">person_add</span> Add Employee
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-slate-400">Loading personnel...</div>
                ) : employees.map((emp) => (
                    <div key={emp.matricule_employe} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="flex items-start space-x-4 relative z-10">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold uppercase">
                                {emp.prenom_employe[0]}{emp.nom_employe[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{emp.prenom_employe} {emp.nom_employe}</h3>
                                <p className="text-primary text-sm font-medium mb-1">{emp.poste || 'Employee'}</p>
                                <p className="text-slate-400 text-xs flex items-center">
                                    <span className="material-icons text-[14px] mr-1">email</span> {emp.email_employe}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex space-x-2">
                            <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg transition-colors">
                                View Profile
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                <span className="material-icons text-[16px]">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HRPage;
