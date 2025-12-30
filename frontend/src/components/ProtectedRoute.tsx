import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'evaluator';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // Redirect evaluators trying to access admin
        if (requiredRole === 'admin') {
            return <Navigate to="/" replace />;
        }
        // Redirect admins trying to access evaluator pages
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
