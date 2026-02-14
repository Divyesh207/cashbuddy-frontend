import React, { createContext, useContext, useState } from 'react';

interface TourContextType {
    isTourActive: boolean;
    startTour: () => void;
    endTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTourActive, setIsTourActive] = useState(false);

    const startTour = () => setIsTourActive(true);
    const endTour = () => setIsTourActive(false);

    return (
        <TourContext.Provider value={{ isTourActive, startTour, endTour }}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
