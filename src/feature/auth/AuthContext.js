import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from './AuthService';

// Create an authentication context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	// Check authentication status on initial load
	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				// Check if user is logged in using AuthService
				if (AuthService.isLoggedIn()) {
					// You might want to fetch user details here if needed
					// For now, we'll just set a logged in state
					setUser({});
				}
			} catch (error) {
				console.error('Authentication check failed', error);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuthStatus();
	}, []);

	const login = async (email, password) => {
		try {
			const userData = await AuthService.login(email, password);
			console.log('User data', userData);
			setUser(userData);
			return userData;
		} catch (error) {
			console.error('Login failed', error);
			throw error;
		}
	};

	const signup = async (email, password, firstName, lastName) => {
		try {
			// First, send email verification
			await AuthService.sendEmailVerification(
				email,
				password,
				firstName,
				lastName
			);

			// You might want to add a step here for OTP verification
			// This is just a placeholder and might need to be adjusted based on your exact flow
			return { message: 'Verification email sent' };
		} catch (error) {
			console.error('Signup failed', error);
			throw error;
		}
	};

	const verifyEmail = async (email, otp) => {
		try {
			const userData = await AuthService.register(email, otp);
			setUser(userData);
			return userData;
		} catch (error) {
			console.error('Email verification failed', error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await AuthService.logout();
			setUser(null);
		} catch (error) {
			console.error('Logout failed', error);
		}
	};

	const isAuthenticated = () => !!user;

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				login,
				signup,
				logout,
				verifyEmail,
				isAuthenticated,
			}}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
