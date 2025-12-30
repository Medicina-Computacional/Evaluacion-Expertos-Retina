import { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';

interface Evaluator {
    id: string;
    email: string;
    name: string;
    completed: number;
    total: number;
}

interface Stats {
    totalCases: number;
    totalEvaluators: number;
    completedEvaluations: number;
    pendingEvaluations: number;
}

export default function AdminPage() {

    const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEvaluator, setNewEvaluator] = useState({ email: '', name: '', password: '' });
    const [editingEvaluator, setEditingEvaluator] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [evalRes, statsRes] = await Promise.all([
                api.get('/admin/evaluators'),
                api.get('/admin/stats'),
            ]);
            setEvaluators(evalRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEvaluator = async (userId: string, name: string) => {
        if (!window.confirm(`¿Está seguro de que desea eliminar al evaluador "${name}"? Esta acción eliminará permanentemente su cuenta y sus evaluaciones.`)) {
            return;
        }

        try {
            await api.delete(`/admin/evaluators/${userId}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting evaluator:', error);
            alert('Error al eliminar el evaluador. Por favor, intente de nuevo.');
        }
    };

    const openEditModal = (evaluator: Evaluator) => {
        setNewEvaluator({ email: evaluator.email, name: evaluator.name, password: '' });
        setEditingEvaluator(evaluator.id);
        setShowAddModal(true);
    };

    const openAddModal = () => {
        setNewEvaluator({ email: '', name: '', password: '' });
        setEditingEvaluator(null);
        setShowAddModal(true);
    };

    const handleSubmitEvaluator = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingEvaluator) {
                // Edit Mode
                await api.put(`/admin/evaluators/${editingEvaluator}`, {
                    name: newEvaluator.name,
                    email: newEvaluator.email
                });
            } else {
                // Add Mode
                await api.post('/admin/evaluators', newEvaluator);
            }

            setNewEvaluator({ email: '', name: '', password: '' });
            setShowAddModal(false);
            setEditingEvaluator(null);
            fetchData();
        } catch (error) {
            console.error('Error saving evaluator:', error);
            alert('Error al guardar el evaluador. Verifique que el correo no esté duplicado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/admin/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'evaluaciones.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6">
                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                            <p className="text-sm text-slate-400 mb-1">Total Casos</p>
                            <p className="text-3xl font-bold text-white">{stats.totalCases}</p>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                            <p className="text-sm text-slate-400 mb-1">Evaluadores</p>
                            <p className="text-3xl font-bold text-white">{stats.totalEvaluators}</p>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                            <p className="text-sm text-slate-400 mb-1">Evaluaciones Completadas</p>
                            <p className="text-3xl font-bold text-teal-400">{stats.completedEvaluations}</p>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                            <p className="text-sm text-slate-400 mb-1">Pendientes</p>
                            <p className="text-3xl font-bold text-amber-400">{stats.pendingEvaluations}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={openAddModal}
                        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-500/25"
                    >
                        + Agregar Evaluador
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all"
                    >
                        Exportar Resultados (CSV)
                    </button>
                </div>

                {/* Evaluators Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700/50">
                        <h2 className="text-lg font-medium text-white">Evaluadores</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-700/30">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Nombre</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Correo</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Progreso</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Estado</th>
                                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {evaluators.map((evaluator) => (
                                    <tr key={evaluator.id} className="hover:bg-slate-700/20">
                                        <td className="px-6 py-4 text-white">{evaluator.name}</td>
                                        <td className="px-6 py-4 text-slate-400">{evaluator.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-teal-500"
                                                        style={{ width: `${evaluator.total > 0 ? (evaluator.completed / evaluator.total) * 100 : 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-400">{evaluator.completed}/{evaluator.total}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${evaluator.completed === evaluator.total
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {evaluator.completed === evaluator.total ? 'Completado' : 'En progreso'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(evaluator)}
                                                    className="text-slate-400 hover:text-teal-400 transition-colors"
                                                    title="Editar evaluador"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEvaluator(evaluator.id, evaluator.name)}
                                                    className="text-slate-400 hover:text-red-400 transition-colors"
                                                    title="Eliminar evaluador"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Add Evaluator Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold text-white mb-6">
                            {editingEvaluator ? 'Editar Evaluador' : 'Agregar Nuevo Evaluador'}
                        </h2>
                        <form onSubmit={handleSubmitEvaluator} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={newEvaluator.name}
                                    onChange={(e) => setNewEvaluator({ ...newEvaluator, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={newEvaluator.email}
                                    onChange={(e) => setNewEvaluator({ ...newEvaluator, email: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            {!editingEvaluator && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        value={newEvaluator.password}
                                        onChange={(e) => setNewEvaluator({ ...newEvaluator, password: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
