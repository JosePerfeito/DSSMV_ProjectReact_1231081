const BASE_URL = 'https://footballmanagement-7507.restdb.io/rest/';
const API_KEY = '27b248f46568ecc48fd818ce96fd5e629b881';

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-apikey': API_KEY,
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erro HTTP ${response.status}`);
    }

    return response.json();
}

// ==== LOGIN SIMPLES ====
// Login com username + password + active = true
export async function loginApi(username, password) {
    const query = {
        username: username,
        password: password,
        active: true,
    };

    const qs = encodeURIComponent(JSON.stringify(query));

    const users = await request(`/users?q=${qs}`, {
        method: 'GET',
    });

    if (Array.isArray(users) && users.length === 1) {
        return users[0];
    }

    throw new Error('Credenciais inválidas');
}

// === CRIAR UTILIZADOR (REGISTO) ===
export async function registerUserApi(username, email, password) {
    const user = {
        username,
        email,
        password,
        active: true,
    };

    return request('/users', {
        method: 'POST',
        body: JSON.stringify(user),
    });
}

// Verificar se já existe utilizador com o mesmo nome OU email
export async function findUserByNameOrEmail(username, email) {
    const query = {
        $or: [{ username: username }, { email: email }],
    };

    const qs = encodeURIComponent(JSON.stringify(query));

    const users = await request(`/users?q=${qs}`, {
        method: 'GET',
    });

    return Array.isArray(users) ? users : [];
}

