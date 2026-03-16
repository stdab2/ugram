import React, { createContext, useState, useEffect } from "react";
import type { User, AuthContextType } from "./types/auth";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/utils";

const baseUrl = getApiBaseUrl();

const AuthContext = createContext<AuthContextType>({
	userAuth: null,
	login: async () => {},
	logout: () => {},
	loading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [userAuth, setUserAuth] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			try {
				await me();
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		initAuth();
	}, []);

	const me = async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			setUserAuth(null);
			return;
		}
		try {
			const response = await fetch(`${baseUrl}/auth/me`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				logout();
				return;
			}

			const data = await response.json();
			setUserAuth(data.user);
		} catch (error) {
			toast.error("An error occurred. Please try again.");
			console.error(error);
			setLoading(false);
			logout();
		}
	};

	const login = async (email: string, password: string) => {
		setLoading(true);

		try {
			const response = await fetch(`${baseUrl}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				throw new Error();
			}

			const data = await response.json();

			localStorage.setItem("token", data.token);
			setUserAuth(data.user);
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		setUserAuth(null);
		window.location.href = "/login";
	};

	return (
		<AuthContext.Provider value={{ userAuth, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = React.useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
