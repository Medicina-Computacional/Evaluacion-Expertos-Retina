import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { Case, EvaluationProgress } from '../types';
import Header from '../components/Header';
import WelcomeModal from '../components/WelcomeModal';

export default function EvaluationPage() {

    const [currentCase, setCurrentCase] = useState<Case | null>(null);
    const [progress, setProgress] = useState<EvaluationProgress>({ completed: 0, total: 0 });
    const [showOverlay, setShowOverlay] = useState(true);
    const [q1, setQ1] = useState<number | null>(null);
    const [q2, setQ2] = useState<number | null>(null);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [isComplete, setIsComplete] = useState(false);

    const fetchNextCase = useCallback(async () => {
        setIsLoading(true);
        try {
            const [caseRes, progressRes] = await Promise.all([
                api.get('/evaluations/next-case'),
                api.get('/evaluations/progress'),
            ]);

            if (caseRes.data) {
                setCurrentCase(caseRes.data);
                setStartTime(Date.now());
            } else {
                setIsComplete(true);
            }
            setProgress(progressRes.data);
        } catch (error) {
            console.error('Error fetching case:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNextCase();
    }, [fetchNextCase]);

    const handleSubmit = async () => {
        if (q1 === null || q2 === null || !currentCase) return;

        setIsSubmitting(true);
        try {
            await api.post('/evaluations', {
                case_id: currentCase.id,
                q1_acceptability: q1,
                q2_confidence: q2,
                comments: comments || null,
                duration_ms: Date.now() - startTime,
            });

            // Reset form and fetch next case
            setQ1(null);
            setQ2(null);
            setComments('');
            await fetchNextCase();
        } catch (error) {
            console.error('Error submitting evaluation:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const q1Options = [
        { value: 1, label: 'No aceptable', desc: 'Inutilizable; no confiaría' },
        { value: 2, label: 'Ediciones mayores', desc: 'Correcciones sustanciales requeridas' },
        { value: 3, label: 'Ediciones menores', desc: 'Correcciones pequeñas y rápidas' },
        { value: 4, label: 'Aceptable', desc: 'No se necesitan ediciones' },
    ];

    const q2Options = [1, 2, 3, 4, 5];

    if (isComplete) {
        return (
            <div className="min-h-screen bg-clinical-dark flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-md px-6 bg-clinical-card p-8 rounded-2xl border border-uabc-green/20 shadow-xl">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-uabc-green to-emerald-600 mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">¡Evaluación Completada!</h1>
                        <p className="text-clinical-muted mb-8">
                            Ha completado la evaluación de todos los casos asignados. Gracias por su participación.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <WelcomeModal />

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col h-[calc(100vh-80px)]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Image Viewer - Takes 2/3 */}
                    <div className="lg:col-span-2 bg-clinical-card rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
                        {/* Viewer Controls */}
                        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-uabc-dark/50">
                            <h2 className="text-lg font-medium text-white flex items-center gap-2">
                                <span>👁️</span> Visor de Imagen
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-clinical-muted">Superposición:</span>
                                <button
                                    onClick={() => setShowOverlay(!showOverlay)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${showOverlay ? 'bg-uabc-green' : 'bg-gray-700'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showOverlay ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Image Display */}
                        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin w-12 h-12 border-4 border-uabc-gold border-t-transparent rounded-full" />
                                    <span className="text-uabc-gold font-medium animate-pulse">Cargando caso...</span>
                                </div>
                            ) : currentCase ? (
                                <div className="relative w-full h-full max-h-full">
                                    {/* Base Image */}
                                    <img
                                        src={currentCase.imageUrl}
                                        alt="Imagen de fondo de ojo"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                    {/* Overlay Mask */}
                                    {showOverlay && (
                                        <img
                                            src={currentCase.maskUrl}
                                            alt="Máscara de segmentación"
                                            className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-70 transition-opacity"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="text-clinical-muted">No hay imagen disponible</div>
                            )}
                        </div>

                        {/* Image Info */}
                        <div className="px-6 py-3 border-t border-gray-800 flex items-center justify-between text-sm text-clinical-muted bg-uabc-dark/30">
                            <span className="font-mono text-uabc-gold">Caso: {currentCase?.id?.split('-')[0] || '-'}</span>
                            <span className="flex items-center gap-3">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Microaneurismas</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Exudados</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Hemorragias</span>
                            </span>
                        </div>
                    </div>

                    {/* Evaluation Form - Takes 1/3 */}
                    <div className="bg-clinical-card rounded-2xl border border-gray-800 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-medium text-white">Evaluación</h2>
                            <div className="text-xs px-2 py-1 rounded bg-uabc-dark text-uabc-gold border border-uabc-green/30">
                                {progress.completed} / {progress.total} Completados
                            </div>
                        </div>

                        {/* Q1 - Acceptability */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">
                                P1. ¿Qué tan aceptable clínicamente es esta segmentación?
                            </h3>
                            <div className="space-y-2">
                                {q1Options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setQ1(option.value)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${q1 === option.value
                                            ? 'bg-uabc-green/20 border-uabc-green text-white shadow-md shadow-uabc-green/10'
                                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${q1 === option.value ? 'border-uabc-green bg-uabc-green' : 'border-gray-500'}`}>
                                                {q1 === option.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <span className="font-medium">{option.label}</span>
                                        </div>
                                        <span className="block text-xs text-gray-500 mt-1 ml-6">{option.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Q2 - Confidence */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">
                                P2. ¿Qué tan seguro está de que los contornos capturan las lesiones adecuadamente?
                            </h3>
                            <div className="flex gap-2">
                                {q2Options.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => setQ2(value)}
                                        className={`flex-1 py-3 rounded-lg border transition-all font-medium ${q2 === value
                                            ? 'bg-uabc-gold/20 border-uabc-gold text-uabc-gold'
                                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                <span>Nada seguro</span>
                                <span>Muy seguro</span>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="mb-6 flex-1">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">
                                Comentarios (opcional)
                            </h3>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Describa problemas u observaciones..."
                                className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-uabc-gold/50 focus:border-uabc-gold/50 resize-none transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={q1 === null || q2 === null || isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando...
                                </span>
                            ) : 'Enviar y Continuar'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
