import axios from 'axios';
import { ServiceOrder, ServiceStatus, AuthResponse } from '../types';

const BASE_URL = 'http://192.168.1.6:8080/api'; // Cambiar por la IP local de tu máquina

const api = axios.create({
    baseURL: BASE_URL,
});

export const getOrders = async () => {
    const response = await api.get<ServiceOrder[]>('/orders');
    return response.data;
};

export const getOrderById = async (id: number) => {
    const response = await api.get<ServiceOrder>(`/orders/${id}`);
    return response.data;
};

export const createOrder = async (order: Partial<ServiceOrder>) => {
    const response = await api.post<ServiceOrder>('/orders', order);
    return response.data;
};

export const updateOrderStatus = async (id: number, status: ServiceStatus, imageUri: string) => {
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `status_change_${Date.now()}.jpg`,
    });

    const response = await api.patch<ServiceOrder>(`/orders/${id}/status?status=${status}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const uploadEvidence = async (orderId: number, imageUri: string) => {
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `evidence_${Date.now()}.jpg`,
    });

    const response = await api.post(`/orders/${orderId}/evidence`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { username, password });
    return response.data;
};

export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (user: any, userRole: string) => {
    const response = await api.post('/users', user, {
        headers: { 'X-User-Role': userRole }
    });
    return response.data;
};

export const deleteUser = async (id: number, userRole: string) => {
    await api.delete(`/users/${id}`, {
        headers: { 'X-User-Role': userRole }
    });
};

export default api;
