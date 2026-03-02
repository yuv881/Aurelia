const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SECRET = import.meta.env.VITE_ADMIN_SECRET || 'aurelia-admin-secret-2025';

const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SECRET}`,
});

async function req(method, path, body) {
    const res = await fetch(`${BASE}/api/admin${path}`, {
        method,
        headers: headers(),
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
}

export const api = {
    // Dashboard
    stats: () => req('GET', '/stats'),
    // Products
    products: () => req('GET', '/products'),
    createProduct: (p) => req('POST', '/products', p),
    updateProduct: (id, p) => req('PUT', `/products/${id}`, p),
    deleteProduct: (id) => req('DELETE', `/products/${id}`),
    // Orders
    orders: () => req('GET', '/orders'),
    updateOrderStatus: (id, status) => req('PATCH', `/orders/${id}/status`, { status }),
};
