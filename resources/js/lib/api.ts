const API_BASE = '/api';

export async function fetchApi<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(options.headers || {}),
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        let message: string;
        try {
            const err = JSON.parse(text);
            message = err?.message || err?.errors?.[0] || res.statusText;
        } catch {
            message = text || res.statusText;
        }
        throw new Error(message || 'API Error');
    }

    // Handle 204 No Content (empty body)
    if (res.status === 204) {
        return undefined as T;
    }

    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text);
}

export async function loginApi(data: { username: string; password: string }) {
    const res = await fetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(body?.message || body?.username?.[0] || 'Login gagal');
    }

    return body;
}

export async function logoutApi() {
    const res = await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error('Logout gagal');
    }

    return res.json().catch(() => ({}));
}


// Customers
export const api = {
    getCustomers: (search?: string) =>
        fetchApi<any[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),

    getCustomer: (id: string) => fetchApi<any>(`/customers/${id}`),

    createCustomer: (data: any) =>
        fetchApi<any>('/customers', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateCustomer: (id: string, data: any) =>
        fetchApi<any>(`/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteCustomer: (id: string) =>
        fetchApi<void>(`/customers/${id}`, { method: 'DELETE' }),

    // Orders
    getOrders: () => fetchApi<any[]>('/orders'),

    getOrder: (id: string) => fetchApi<any>(`/orders/${id}`),

    createOrder: (data: any) =>
        fetchApi<any>('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateOrder: (id: string, data: any) =>
        fetchApi<any>(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteOrder: (id: string) =>
        fetchApi<void>(`/orders/${id}`, { method: 'DELETE' }),

    updateOrderStatus: (id: string, status: string) =>
        fetchApi<any>(`/orders/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status }),
        }),

    // Services
    getServices: () => fetchApi<any[]>('/services'),

    createService: (data: any) =>
        fetchApi<any>('/services', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateService: (id: string, data: any) =>
        fetchApi<any>(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteService: (id: string) =>
        fetchApi<void>(`/services/${id}`, { method: 'DELETE' }),

    // Expenses
    getExpenses: () => fetchApi<any[]>('/expenses'),

    createExpense: (data: any) =>
        fetchApi<any>('/expenses', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateExpense: (id: string, data: any) =>
        fetchApi<any>(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteExpense: (id: string) =>
        fetchApi<void>(`/expenses/${id}`, { method: 'DELETE' }),

    // Dashboard
    getDashboardStats: () => fetchApi<any>('/dashboard/stats'),

    // Payments
    getPayments: (orderId: string) => fetchApi<any[]>(`/orders/${orderId}/payments`),

    createPayment: (orderId: string, data: any) =>
        fetchApi<any>(`/orders/${orderId}/payments`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // WhatsApp
    sendWhatsApp: (orderId: string) =>
        fetchApi<any>(`/orders/${orderId}/send-wa`, { method: 'POST' }),

    sendPaymentReminder: (orderId: string) =>
        fetchApi<any>(`/orders/${orderId}/send-reminder`, { method: 'POST' }),

    // Settings
    getSettings: () => fetchApi<any>('/settings'),

    updateSettings: (data: any) =>
        fetchApi<any>('/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};
