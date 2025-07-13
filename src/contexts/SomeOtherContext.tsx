import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

interface SomeOtherContextType {
  value: string;
  setValue: (v: string) => void;
  doSomething: () => void;
  expensiveValue: number;
}

const SomeOtherContext = createContext<SomeOtherContextType | undefined>(undefined);

export const SomeOtherProvider: React.FC<{ children: ReactNode }> = React.memo(({ children }) => {
  const [value, setValue] = useState('');
  // Memoize event handler
  const doSomething = useCallback(() => {
    // ...logic...
  }, []);
  // Memoize expensive calculation
  const expensiveValue = useMemo(() => {
    // ...expensive calculation...
    return value.length * 42;
  }, [value]);

  return (
    <SomeOtherContext.Provider value={{ value, setValue, doSomething, expensiveValue }}>
      {children}
    </SomeOtherContext.Provider>
  );
});

export const useSomeOtherContext = () => {
  const ctx = useContext(SomeOtherContext);
  if (!ctx) throw new Error("useSomeOtherContext must be used within a SomeOtherProvider");
  return ctx;
};
