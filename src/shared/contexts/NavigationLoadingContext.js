'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const NavigationLoadingContext = createContext({
    isLoading: false,
    startLoading: () => { },
    stopLoading: () => { }
});

export function NavigationLoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = useCallback(() => {
        setIsLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    return (
        <NavigationLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}
        </NavigationLoadingContext.Provider>
    );
}

export function useNavigationLoading() {
    const context = useContext(NavigationLoadingContext);
    if (!context) {
        throw new Error('useNavigationLoading must be used within NavigationLoadingProvider');
    }
    return context;
}
