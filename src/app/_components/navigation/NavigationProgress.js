'use client';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';

export default function NavigationProgress({ corPrimaria }) {
    const { isLoading } = useNavigationLoading();

    if (!isLoading) return null;

    return (
        <div className="w-full h-1 overflow-hidden bg-base-200">
            <div
                className="h-full animate-progress-indeterminate"
                style={{
                    backgroundColor: corPrimaria || 'var(--color-primary)',
                    width: '30%'
                }}
            />
            <style jsx>{`
                @keyframes progress-indeterminate {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(400%);
                    }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
