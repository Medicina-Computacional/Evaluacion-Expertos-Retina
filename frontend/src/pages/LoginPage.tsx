import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Credenciales inválidas. Por favor, intente de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md px-8">
                {/* Branding Logos */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="h-16 bg-white/10 rounded-lg p-2 flex items-center justify-center">
                        <img src="/logos/uabc-logo-ser.png" alt="UABC" className="h-full w-auto object-contain" />
                    </div>
                    <div className="h-12 w-px bg-white/10 mx-2"></div>
                    <img src="/logos/ecs-logo.jpg" alt="ECS" className="h-12 w-auto rounded-md" />
                    <img src="/logos/fiad-logo.png" alt="FIAD" className="h-12 w-auto bg-white rounded-md p-0.5" />
                </div>

                {/* Title Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Plataforma de Evaluación
                    </h1>
                    <p className="text-slate-400">
                        Segmentaciones Oftalmológicas con Cómputo Inteligente
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="su.correo@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                </div>

                <div className="flex flex-col items-center justify-center text-slate-500 text-sm mt-8 gap-1">
                    <p className="text-center">
                        Desarrollado con ❤️ por el equipo de:
                    </p>
                    <img src="/logos/group-logo.png" alt="Medicina Computacional" className="h-10 w-auto rounded-full bg-white p-0.5 mt-1" />
                </div>
            </div>
        </div>
    );
}
