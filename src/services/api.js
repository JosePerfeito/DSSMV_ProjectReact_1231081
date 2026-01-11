const BASE_URL = 'https://footballmanagement-7507.restdb.io/rest/';
const RESTDB_API_KEY = '27b248f46568ecc48fd818ce96fd5e629b881';

// nomes das coleções
const COL = {
    USERS: 'users',
    TEAMS: 'teams',
    PLAYERS: 'players',
    GAMES: 'games',
    GAMESTATS: 'gamestats',
};

// ImgBB
const IMGBB_API_KEY = 'b8e2a90f6bd6751c86ce3394097b7006';

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const isForm = options.body instanceof FormData;

    const res = await fetch(url, {
        ...options,
        headers: {
            ...(isForm ? {} : { 'Content-Type': 'application/json' }),
            'x-apikey': RESTDB_API_KEY,
            ...(options.headers || {}),
        },
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
    return text ? JSON.parse(text) : null;
}

/* ================= USERS ================= */

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

/* ================= TEAMS ================= */

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

/* ================= PLAYERS ================= */

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

/* ================= GAMES ================= */

export async function getGamesByTeam(teamId) {
    const q = encodeURIComponent(JSON.stringify({ id_team: teamId }));
    return request(`/${COL.GAMES}?q=${q}&sort=date&dir=-1`, { method: 'GET' });
}

export async function createGameApi(teamId, date, opponent, goalsFor, goalsAgainst, home) {
    return request(`/${COL.GAMES}`, {
        method: 'POST',
        body: JSON.stringify({
            id_team: teamId,
            date,
            opponent,
            goals_for: Number(goalsFor),
            goals_against: Number(goalsAgainst),
            home: Boolean(home),
        }),
    });
}

/* ================= GAMESTATS ================= */

export async function createGameStatApi(gameId, playerId, starter, goals, assists, yellowCards, redCard) {
    return request(`/${COL.GAMESTATS}`, {
        method: 'POST',
        body: JSON.stringify({
            id_game: gameId,
            id_player: playerId,
            starter: Boolean(starter),
            goals: Number(goals) || 0,
            assists: Number(assists) || 0,
            yellow_cards: Number(yellowCards) || 0,
            red_card: Boolean(redCard),
        }),
    });
}

export async function getGameStatsByGame(gameId) {
    const q = encodeURIComponent(JSON.stringify({ id_game: gameId }));
    return request(`/${COL.GAMESTATS}?q=${q}`, { method: 'GET' });
}

export async function getGameStatsByGameIds(gameIds) {
    if (!Array.isArray(gameIds) || gameIds.length === 0) return [];
    const q = encodeURIComponent(JSON.stringify({ id_game: { $in: gameIds } }));
    return request(`/${COL.GAMESTATS}?q=${q}`, { method: 'GET' });
}

export async function getGameStatsByPlayer(playerId) {
    const q = encodeURIComponent(JSON.stringify({ id_player: playerId }));
    return request(`/${COL.GAMESTATS}?q=${q}`, { method: 'GET' });
}

export async function createGameWithStats(teamId, date, opponent, goalsFor, goalsAgainst, home, statsArray) {
    const game = await createGameApi(teamId, date, opponent, goalsFor, goalsAgainst, home);
    const gameId = game._id || game.id;

    await Promise.all(
        (statsArray || []).map((s) =>
            createGameStatApi(
                gameId,
                s.id_player,
                s.starter,
                s.goals,
                s.assists,
                s.yellow_cards,
                s.red_card
            )
        )
    );

    return game;
}

/* ================= RESTDB DELETE HELPERS ================= */

export async function deleteById(collection, id) {
    if (!id) return null;
    return request(`/${collection}/${id}`, { method: 'DELETE' });
}

export async function deleteTeamApi(teamId) {
    return deleteById(COL.TEAMS, teamId);
}
export async function deletePlayerApi(playerId) {
    return deleteById(COL.PLAYERS, playerId);
}
export async function deleteGameApi(gameId) {
    return deleteById(COL.GAMES, gameId);
}
export async function deleteGameStatApi(gameStatId) {
    return deleteById(COL.GAMESTATS, gameStatId);
}

export async function deleteUserApi(userId) {
    return deleteById(COL.USERS, userId);
}

/* ================= ImgBB UPLOAD ================= */

export async function uploadImageToImgbb(base64Image) {
    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', base64Image);

    const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: form,
    });

    const json = await res.json();

    const imageUrl = json?.data?.url;
    const deleteUrl = json?.data?.delete_url;

    if (!res.ok || !imageUrl || !deleteUrl) {
        throw new Error('Erro ao enviar imagem para ImgBB');
    }

    return { imageUrl, deleteUrl };
}


/* ================= ImgBB DELETE (API OFICIAL) ================= */

// delete_url costuma ser: https://ibb.co/<deleteHash>
// (o hash está no último segmento)
function extractImgbbDeleteHash(deleteUrl) {
    if (!deleteUrl || typeof deleteUrl !== 'string') return null;
    const parts = deleteUrl.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
}

export async function deleteImageFromImgbb(deleteUrl) {
    try {
        const deleteHash = extractImgbbDeleteHash(deleteUrl);
        if (!deleteHash) return false;

        const url = `https://api.imgbb.com/1/image/${deleteHash}?key=${IMGBB_API_KEY}`;
        const res = await fetch(url, { method: 'DELETE' });

        // ImgBB às vezes devolve json mesmo em erro
        const json = await res.json().catch(() => null);

        if (!res.ok) {
            console.warn('ImgBB delete falhou:', res.status, json || '');
            return false;
        }

        return true;
    } catch (e) {
        console.warn('Falha a apagar imagem ImgBB:', e?.message || e);
        return false;
    }
}

/* ================= CASCADE DELETE (TEAM) ================= */

export async function deleteTeamCascade(team) {
    const teamId = team?._id || team?.id;
    if (!teamId) throw new Error('Equipa inválida');

    // 1) buscar jogadores e jogos
    const [players, games] = await Promise.all([
        getPlayersByTeam(teamId),
        getGamesByTeam(teamId),
    ]);

    // 2) buscar stats de cada jogo
    const statsByGame = await Promise.all(
        (games || []).map((g) => getGameStatsByGame(g._id || g.id))
    );
    const allStats = statsByGame.flat().filter(Boolean);

    // 3) apagar imagens primeiro
    // equipa: image_delete_url
    await deleteImageFromImgbb(team?.image_delete_url);

    // jogadores: photo_delete_url
    await Promise.all((players || []).map((p) => deleteImageFromImgbb(p?.photo_delete_url)));

    // 4) apagar gamestats -> jogos -> jogadores -> equipa
    await Promise.all(allStats.map((s) => deleteGameStatApi(s._id || s.id)));
    await Promise.all((games || []).map((g) => deleteGameApi(g._id || g.id)));
    await Promise.all((players || []).map((p) => deletePlayerApi(p._id || p.id)));
    await deleteTeamApi(teamId);

    return true;
}
