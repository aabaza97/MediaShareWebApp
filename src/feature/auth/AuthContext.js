import React, { createContext, useState, useContext } from 'react';

// Create an authentication context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	const login = (userData) => {
		// Simulate login - in a real app, this would involve backend authentication
		setUser(userData);
		localStorage.setItem('user', JSON.stringify(userData));
	};

	const signup = (userData) => {
		// Simulate signup - in a real app, this would involve backend registration
		setUser(userData);
		localStorage.setItem('user', JSON.stringify(userData));
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem('user');
	};

	// Check for existing user on initial load
	React.useEffect(() => {
		const savedUser = localStorage.getItem('user');
		if (savedUser) {
			setUser(JSON.parse(savedUser));
		}
	}, []);

	return (
		<AuthContext.Provider value={{ user, login, signup, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
