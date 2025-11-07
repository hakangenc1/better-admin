import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme = "light" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // Sync theme changes with cookie and DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Update DOM class
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Set cookie for server-side rendering
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Helper function to get theme from cookie
export function getThemeFromCookie(cookieHeader: string | null): Theme {
  if (!cookieHeader) return "light";
  
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const themeCookie = cookies.find((c) => c.startsWith("theme="));
  
  if (themeCookie) {
    const theme = themeCookie.split("=")[1] as Theme;
    return theme === "dark" ? "dark" : "light";
  }
  
  return "light";
}
