import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

interface LabContextType {
  labNumber: number;
  setLabNumber: (lab: number) => void;
  isLocked: boolean;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const isLocked = user?.role === 'IndoorManager';

  const [labNumber, setLabNumberState] = useState<number>(() => {
    // user is null here on first render (AuthProvider loads from localStorage async)
    // so we always read from localStorage; the useEffect below corrects it for IndoorManager
    const saved = localStorage.getItem('selectedLab');
    return saved ? parseInt(saved) : 1;
  });

  // When user loads (e.g. page refresh), sync locked lab from profile
  useEffect(() => {
    if (isLocked && user?.labNumber) {
      setLabNumberState(user.labNumber);
    }
  }, [user]);

  const setLabNumber = (lab: number) => {
    if (isLocked) return; // IndoorManager cannot change their lab
    setLabNumberState(lab);
    localStorage.setItem('selectedLab', lab.toString());
  };

  return (
    <LabContext.Provider value={{ labNumber, setLabNumber, isLocked }}>
      {children}
    </LabContext.Provider>
  );
};

export const useLabContext = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLabContext must be used within LabProvider');
  }
  return context;
};
