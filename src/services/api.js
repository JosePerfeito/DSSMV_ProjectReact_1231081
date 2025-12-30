const BASE_URL = 'https://footballmanagement-7507.restdb.io/rest/';
const RESTDB_API_KEY = '27b248f46568ecc48fd818ce96fd5e629b881';

// nomes das coleções EXACTOS
const COL = {
    USERS: 'users',
    TEAMS: 'teams',
    PLAYERS: 'players',
    GAMES: 'Games',
};

// ImgBB
const IMGBB_API_KEY = 'b8e2a90f6bd6751c86ce3394097b7006';

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-apikey': RESTDB_API_KEY,
            ...(options.headers || {}),
        },
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
    return text ? JSON.parse(text) : null;
}

/* ===== Users ===== */

export async function loginApi(username, password) {
    const q = encodeURIComponent(JSON.stringify({ username, password, active: true }));
    const users = await request(`/${COL.USERS}?q=${q}&max=1`, { method: 'GET' });
    if (!Array.isArray(users) || users.length === 0) throw new Error('Login inválido');
    return users[0];
}

export async function existsUsername(username) {
    const q = encodeURIComponent(JSON.stringify({ username }));
    const res = await request(`/${COL.USERS}?q=${q}&max=1`, { method: 'GET' });
    return Array.isArray(res) && res.length > 0;
}

export async function existsEmail(email) {
    const q = encodeURIComponent(JSON.stringify({ email }));
    const res = await request(`/${COL.USERS}?q=${q}&max=1`, { method: 'GET' });
    return Array.isArray(res) && res.length > 0;
}

export async function registerApi(username, email, password) {
    return request(`/${COL.USERS}`, {
        method: 'POST',
        body: JSON.stringify({ username, email, password, active: true }),
    });
}

/* ===== Teams ===== */

export async function getTeamsByUser(userId) {
    const q = encodeURIComponent(JSON.stringify({ user_id: userId }));
    return request(`/${COL.TEAMS}?q=${q}`, { method: 'GET' });
}

export async function createTeamApi(userId, name, imageUrl, deleteUrl) {
    return request(`/${COL.TEAMS}`, {
        method: 'POST',
        body: JSON.stringify({
            user_id: userId,
            name,
            image: imageUrl,
            image_delete_url: deleteUrl,
        }),
    });
}

/* ===== Players ===== */

export async function getPlayersByTeam(teamId) {
    const q = encodeURIComponent(JSON.stringify({ id_team: teamId }));
    return request(`/${COL.PLAYERS}?q=${q}`, { method: 'GET' });
}

export async function existsPlayerNumber(teamId, number) {
    const q = encodeURIComponent(JSON.stringify({ id_team: teamId, number: Number(number) }));
    const res = await request(`/${COL.PLAYERS}?q=${q}&max=1`, { method: 'GET' });
    return Array.isArray(res) && res.length > 0;
}

export async function createPlayerApi(teamId, name, birthday, number, position, photoUrl, deleteUrl) {
    return request(`/${COL.PLAYERS}`, {
        method: 'POST',
        body: JSON.stringify({
            id_team: teamId,
            name,
            birthday,
            number: Number(number),
            position,
            photo: photoUrl,
            photo_delete_url: deleteUrl,
        }),
    });
}

/* ===== Games ===== */
export async function getGamesByTeam(teamId) {
    const q = encodeURIComponent(JSON.stringify({ id_team: teamId }));
    return request(`/Games?q=${q}&sort=date&dir=-1`, { method: 'GET' });
}


/* ===== ImgBB ===== */

export async function uploadImageToImgbb(base64Image) {
    // base64Image deve vir SEM prefixo "data:image/..."
    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', base64Image);

    const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: form,
    });

    const json = await res.json();
    if (!res.ok || !json?.data?.url) throw new Error('Erro ao enviar imagem para ImgBB');

    return {
        imageUrl: json.data.url,
        deleteUrl: json.data.delete_url,
    };
}
