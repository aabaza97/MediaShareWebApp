import axios from 'axios';

// Base URL for your API
const API_BASE_URL = 'http://localhost:8000/api/v1/auth';

const endpoints = {
	SEND_EMAIL_VERIFICATION: '/emails/verify',
	REGISTER: '/register',
	LOGIN: '/login',
	REFRESH_ACCESS_TOKEN: '/tokens/refresh',
	LOGOUT: '/logout',
};

// Constants
const StorageKey = {
	AccessToken: 'accessToken',
	RefreshToken: 'refreshToken',
	LastRefresh: 'lastTokenRefresh',
	USER: 'user',
};

// Create an axios instance with base configuration
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

class AuthService {
	// 1. Send Email Verification
	async sendEmailVerification(email, password, firstName, lastName) {
		try {
			const response = await apiClient.post(
				endpoints.SEND_EMAIL_VERIFICATION,
				{
					email,
					password,
					first_name: firstName,
					last_name: lastName,
				}
			);
			return response.data;
		} catch (error) {
			this.handleError(error);
		}
	}

	// 2. Register User
	async register(email, otp) {
		try {
			const response = await apiClient.post(endpoints.REGISTER, {
				email,
				otp,
			});

			if (response.status !== 201) {
				throw new Error('Registration failed');
			}

			// Store tokens
			this.storeTokens(response.data);

			// Update user details
			this.updateUser(response.data);

			return this.getUser();
		} catch (error) {
			this.handleError(error);
		}
	}

	// 3. Login
	async login(email, password) {
		try {
			const response = await apiClient.post(endpoints.LOGIN, {
				email,
				password,
			});

			if (response.status !== 200) {
				throw new Error('Login failed');
			}

			// Store tokens
			this.storeTokens(response.data);

			// Update user details
			this.updateUser(response.data);

			return this.getUser();
		} catch (error) {
			this.handleError(error);
		}
	}

	// 4. Refresh Token
	async refreshToken() {
		try {
			const refreshToken = this.getRefreshToken();

			if (!refreshToken) {
				throw new Error('No refresh token found');
			}

			const response = await apiClient.post(
				endpoints.REFRESH_ACCESS_TOKEN,
				{},
				{
					headers: {
						Authorization: `Bearer ${refreshToken}`,
					},
				}
			);

			// Update tokens
			return this.updateAccessToken(response.data);
		} catch (error) {
			// If refresh fails, logout user
			console.error('Refresh token error:', error);
			throw error;
		}
	}

	// 5. Logout
	async logout() {
		try {
			// Get access token or refresh it if needed
			let accessToken =
				this.getAccessToken() || (await this.refreshToken());

			if (!accessToken) {
				throw new Error('No access token found');
			}

			const response = await apiClient.post(
				endpoints.LOGOUT,
				{},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status !== 200) {
				throw new Error('Logout failed');
			}

			// Clear local storage
			this.clearTokens();
		} catch (error) {
			this.handleError(error);
		}
	}

	// Error Handling Utility
	handleError(error) {
		// Centralized error handling
		if (error.response) {
			// The request was made and the server responded with a status code
			const { data, status } = error.response;

			console.error('Error data:', data);
			console.error('Error status:', status);

			// Common error handling
			switch (status) {
				case 401:
					// Unauthorized
					// this.clearTokens();
					throw new Error('Unauthorized');
				case 403:
					// Forbidden
					throw new Error(
						'You do not have permission to perform this action'
					);
				case 404:
					if (data.error) {
						throw new Error(data.error.message);
					}
					throw new Error('Requested resource not found');
				case 500:
					throw new Error('Server error. Please try again later.');
				default:
					throw new Error(
						error.response.data.message ||
							'An unexpected error occurred'
					);
			}
		} else if (error.request) {
			// The request was made but no response was received
			console.error('No response received:', error.request);
			throw new Error(
				'No response from server. Please check your internet connection.'
			);
		} else {
			// Something happened in setting up the request
			console.error('Error:', error.message);
			throw error;
		}
	}

	// Utility function to check if user is logged in
	isLoggedIn() {
		return this.getRefreshToken() !== null;
	}

	// Utility function to get access token
	getAccessToken() {
		// return access token from local storage if exists && not expired
		const accessToken = localStorage.getItem(StorageKey.AccessToken);
		const lastTokenRefresh = localStorage.getItem(StorageKey.LastRefresh);
		if (!accessToken || !lastTokenRefresh) return null;
		if (Date.now() - lastTokenRefresh > 1 * 60 * 1000) {
			// 3 minutes
			return null;
		}
		return accessToken;
	}

	// Utility function to get refresh token
	getRefreshToken() {
		return localStorage.getItem(StorageKey.RefreshToken);
	}

	// Utility function to handle token storage
	storeTokens({ data }) {
		if (data.access_token && data.refresh_token) {
			console.log('Storing tokens:', data);
			localStorage.setItem(StorageKey.AccessToken, data.access_token);
			localStorage.setItem(StorageKey.RefreshToken, data.refresh_token);
			localStorage.setItem(StorageKey.LastRefresh, Date.now());
		}
	}

	// Utility function to update access token
	updateAccessToken({ data }) {
		if (data.access_token) {
			localStorage.setItem(StorageKey.AccessToken, data.access_token);
			localStorage.setItem(StorageKey.LastRefresh, Date.now());
		}

		return data.access_token;
	}

	// Utility function to clear tokens
	clearTokens() {
		localStorage.removeItem(StorageKey.AccessToken);
		localStorage.removeItem(StorageKey.RefreshToken);
		localStorage.removeItem(StorageKey.LastRefresh);

		// Clear user details
		localStorage.removeItem(StorageKey.USER);
	}

	// Utility function to get user details
	getUser() {
		const user = localStorage.getItem(StorageKey.USER);
		return user ? JSON.parse(user) : null;
	}

	// Utility function to update user details
	updateUser({ data }) {
		const { id, email, first_name, last_name } = data;
		localStorage.setItem(
			StorageKey.USER,
			JSON.stringify({ id, email, first_name, last_name })
		);
	}
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AuthService();
