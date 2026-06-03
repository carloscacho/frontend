'use client'
import React, { createContext, useContext, useState } from 'react';

const EventThemeContext = createContext(null);

export function EventThemeProvider({ children, initialEvent }) {
  const [themeEvent, setThemeEvent] = useState(initialEvent);

  return (
    <EventThemeContext.Provider value={{ themeEvent, setThemeEvent }}>
      {children}
    </EventThemeContext.Provider>
  );
}

export function useEventTheme() {
  const context = useContext(EventThemeContext);
  if (!context) {
    throw new Error('useEventTheme must be used within an EventThemeProvider');
  }
  return context;
}
