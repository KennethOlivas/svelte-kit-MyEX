import { writable } from 'svelte/store';
import { amp, browser, dev, mode, prerendering } from '$app/env';

export const createAccessTokenStore = () => {
	const { set, update, subscribe } = writable(getAccessToken());

	return {
		subscribe,
		reset: (value) => {
			set(value);
			if (browser) {
				localStorage.setItem('access_token', value);
			}
		}
	};
};

export const createRefreshTokenStore = () => {
	const { set, update, subscribe } = writable(getRefreshToken());

	return {
		subscribe,
		reset: (value) => {
			set(value);
			if (browser) {
				localStorage.setItem('refresh_token', value);
			}
		}
	};
};

export const createUserStore = () => {
	const { set, update, subscribe } = writable(getUser());

	return {
		subscribe,
		reset: (value) => {
			set(value);
			if (browser) {
				localStorage.setItem('user', JSON.stringify(value));
			}
		}
	};
};

const getAccessToken = () => {
	if (browser) {
		return localStorage.getItem('access_token');
	}
};
const getRefreshToken = () => {
	if (browser) {
		return localStorage.getItem('refresh_token');
	}
};
const getUser = () => {
	if (browser) {
		return JSON.parse(localStorage.getItem('user'));
	}
};

export const access_token = createAccessTokenStore();
export const refresh_token = createRefreshTokenStore();
export const user = createUserStore();
