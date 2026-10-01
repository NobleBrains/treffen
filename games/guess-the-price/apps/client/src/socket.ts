import { io } from 'socket.io-client';

const getSocketUrl = () => {
	const envUrl = import.meta.env.VITE_SOCKET_URL;
	if (envUrl && !envUrl.includes('localhost')) {
		return envUrl;
	}
	const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
	return `http://${host}:3005/mp-ws`;
};

export const socket = io(getSocketUrl(), { autoConnect: false });
