import axios, { all } from 'axios';
import AuthService from '../auth/AuthService';

// Base URL for your API
const API_BASE_URL = 'http://localhost:8000/api/v1/media';

const endpoints = {
	ALL: '/',
	IMAGE: '/images',
	VIDEO: '/movies',
};

// Constants
const StorageKey = {};

// Create an axios instance with base configuration
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

class MediaService {
	// Fetch all uploads
	async fetchAll(inPage = 0) {
		let accessToken =
			AuthService.getAccessToken() || (await AuthService.refreshToken());

		if (!accessToken) {
			throw new Error('No access token found');
		}

		const response = await apiClient.get(endpoints.ALL + inPage, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		return response.data;
	}
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new MediaService();
