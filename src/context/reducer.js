export const initialState = {
    auth: { loading: false, error: null, user: null },
    teams: { loading: false, error: null, data: [] },
    players: { loading: false, error: null, data: [], teamId: null },
    games: { loading: false, error: null, data: [], teamId: null },
    playerStats: { loading: false, error: null, data: [], playerId: null },
};

export default function reducer(state, action) {
    switch (action.type) {
        // AUTH
        case 'LOGIN_STARTED':
            return { ...state, auth: { loading: true, error: null, user: null } };

        case 'LOGIN_SUCCESS':
            return { ...state, auth: { loading: false, error: null, user: action.payload.user } };

        case 'LOGIN_FAILURE':
            return { ...state, auth: { loading: false, error: action.payload.error, user: null } };

        case 'LOGOUT':
            return {
                ...state,
                auth: { loading: false, error: null, user: null },
                teams: { loading: false, error: null, data: [] },
                players: { loading: false, error: null, data: [], teamId: null },
                games: { loading: false, error: null, data: [], teamId: null },
                playerStats: {
                    loading: false,
                    error: null,
                    data: { games: 0, goals: 0, assists: 0, yellows: 0, reds: 0 },
                    playerId: null,
                },
            };

        case 'REGISTER_STARTED':
            return { ...state, auth: { ...state.auth, loading: true, error: null } };

        case 'REGISTER_SUCCESS':
            return { ...state, auth: { ...state.auth, loading: false, error: null } };

        case 'REGISTER_FAILURE':
            return { ...state, auth: { ...state.auth, loading: false, error: action.payload.error } };

        // TEAMS
        case 'FETCH_TEAMS_STARTED':
            return { ...state, teams: { ...state.teams, loading: true, error: null } };

        case 'FETCH_TEAMS_SUCCESS':
            return { ...state, teams: { loading: false, error: null, data: action.payload.data } };

        case 'FETCH_TEAMS_FAILURE':
            return { ...state, teams: { loading: false, error: action.payload.error, data: [] } };

        // PLAYERS
        case 'FETCH_PLAYERS_STARTED':
            return { ...state, players: { ...state.players, loading: true, error: null } };

        case 'FETCH_PLAYERS_SUCCESS':
            return {
                ...state,
                players: {
                    loading: false,
                    error: null,
                    data: action.payload.data,
                    teamId: action.payload.teamId,
                },
            };

        case 'FETCH_PLAYERS_FAILURE':
            return {
                ...state,
                players: {
                    loading: false,
                    error: action.payload.error,
                    data: [],
                    teamId: state.players.teamId,
                },
            };

        // GAMES
        case 'FETCH_GAMES_STARTED':
            return { ...state, games: { ...state.games, loading: true, error: null } };

        case 'FETCH_GAMES_SUCCESS':
            return {
                ...state,
                games: {
                    loading: false,
                    error: null,
                    data: action.payload.data,
                    teamId: action.payload.teamId,
                },
            };

        case 'FETCH_GAMES_FAILURE':
            return {
                ...state,
                games: {
                    loading: false,
                    error: action.payload.error,
                    data: [],
                    teamId: state.games.teamId,
                },
            };

// PLAYER STATS
        case 'FETCH_PLAYER_STATS_STARTED':
            return { ...state, playerStats: { ...state.playerStats, loading: true, error: null } };

        case 'FETCH_PLAYER_STATS_SUCCESS':
            return {
                ...state,
                playerStats: {
                    loading: false,
                    error: null,
                    data: action.payload.data,
                    playerId: action.payload.playerId,
                },
            };

        case 'FETCH_PLAYER_STATS_FAILURE':
            return {
                ...state,
                playerStats: {
                    loading: false,
                    error: action.payload.error,
                    data: [],
                    playerId: state.playerStats.playerId,
                },
            };

        case 'CLEAR_PLAYER_STATS':
            return { ...state, playerStats: { loading: false, error: null, data: [], playerId: null } };

        // default SEMPRE no fim
        default:
            return state;
    }
}
