import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const WELCOME_KEY = 'ophthalmology_welcome_seen_session';

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Check if seen in this session
        const hasSeen = sessionStorage.getItem(WELCOME_KEY);
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, []);

    const handleAccept = () => {
        sessionStorage.setItem(WELCOME_KEY, 'true');
        setIsOpen(false);
    };

    const getLastName = (fullName: string) => {
        const parts = fullName.trim().split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : parts[0];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-clinical-text max-w-2xl w-full rounded-xl shadow-2xl border border-uabc-green overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-uabc-green px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">📋</span> Información del Estudio
                    </h2>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-4 text-sm md:text-base leading-relaxed">
                    <p className="font-semibold text-lg text-uabc-gold">
                        Estimado/a Dr. {user?.name ? getLastName(user.name) : ''}:
                    </p>

                    <p>
                        Agradecemos su valiosa colaboración en esta investigación. Su experiencia en la evaluación de
                        retinopatía diabética mediante fundoscopía digital es fundamental para este proyecto.
                    </p>

                    <div className="bg-uabc-dark/30 p-4 rounded-lg border border-uabc-green/30">
                        <h3 className="font-bold text-white mb-2">Objetivo del estudio:</h3>
                        <p>
                            Buscamos determinar, mediante opinión de expertos, la pertinencia clínica de las segmentaciones
                            de microaneurismas, hemorragias y exudados generadas por un sistema de inteligencia artificial
                            desarrollado por el grupo de Medicina Computacional.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-1">Sobre la evaluación:</h3>
                        <p>
                            El proceso es sencillo y ágil. La plataforma es intuitiva y accesible desde cualquier dispositivo
                            con conexión a internet. No es necesario completar todas las imágenes en una sola sesión:
                            <span className="font-semibold text-uabc-gold"> el sistema guarda automáticamente su avance.</span>
                        </p>
                    </div>

                    <div className="text-xs text-clinical-muted pt-2 border-t border-gray-700">
                        <p className="font-semibold">Contacto:</p>
                        <p>Para cualquier duda o comentario, puede comunicarse con el Dr. Gener José Avilés Rodríguez: <a href="mailto:aviles.gener@uabc.edu.mx" className="text-uabc-gold hover:underline">aviles.gener@uabc.edu.mx</a></p>
                        <p className="mt-1">Gracias por su tiempo y dedicación.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-black/20 border-t border-gray-800 flex justify-end">
                    <button
                        onClick={handleAccept}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-2.5 px-6 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-500/25 transform hover:-translate-y-0.5"
                    >
                        Entendido, comenzar
                    </button>
                </div>
            </div>
        </div>
    );
}
