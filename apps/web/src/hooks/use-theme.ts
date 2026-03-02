import { useContext } from "react";
import { ThemeProviderContext } from "@/contexts/ThemeContext";

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);
	return context;
};
