const BASE_URL = 'https://footballmanagement-7507.restdb.io/rest/';
const API_KEY = '27b248f46568ecc48fd818ce96fd5e629b881';

//const BASE_URL = 'https://footballmanagement-ded7.restdb.io/rest/';
//const API_KEY = 'b3e7d5a7c3fce57cf3e17440364e8af53d6e8';

const IMGBB_API_KEY = 'b8e2a90f6bd6751c86ce3394097b7006';

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
export async function uploadImageToImgbb(base64Image) {
    const formData = new FormData();
    formData.append('image', base64Image);

    const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
            method: 'POST',
            body: formData,
        }
    );

    const json = await response.json();

    if (!response.ok || !json.success) {
        throw new Error('Falha ao fazer upload para ImgBB');
    }

    const imageUrl = json.data.display_url;
    const deleteUrl = json.data.delete_url;

    return { imageUrl, deleteUrl };
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
// === EQUIPAS DO UTILIZADOR ===
export async function getTeamsByUser(userId) {
    const query = { user_id: userId }; // <- aqui assumes que guardas o _id do user

    const qs = encodeURIComponent(JSON.stringify(query));

    return request(`/teams?q=${qs}`, {
        method: 'GET',
    });
}
// === CRIAR EQUIPA ===
export async function createTeamApi(userId, name, imageUrl, imageDeleteUrl) {
    const team = {
        user_id: userId,
        name,
        image: imageUrl,
        image_delete_url: imageDeleteUrl,
    };

    return request('/teams', {
        method: 'POST',
        body: JSON.stringify(team),
    });
}
// === JOGADORES DA EQUIPA ===
export async function getPlayersByTeam(teamId) {
    const query = { id_team: teamId };

    const qs = encodeURIComponent(JSON.stringify(query));

    return request(`/players?q=${qs}`, {
        method: 'GET',
    });
}
// === CRIAR JOGADOR ===
export async function createPlayerApi(
    teamId,
    name,
    birthday,
    number,
    position,
    photoUrl,
    photoDeleteUrl
) {
    const player = {
        id_team: teamId,
        name,
        birthday,
        number,
        position,
        photo: photoUrl,
        photo_delete_url: photoDeleteUrl,
    };

    return request('/players', {
        method: 'POST',
        body: JSON.stringify(player),
    });
}



