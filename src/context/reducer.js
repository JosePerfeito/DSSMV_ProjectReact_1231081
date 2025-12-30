export const initialState = {
    auth: { loading: false, error: null, user: null },
    teams: { loading: false, error: null, data: [] },
    players: { loading: false, error: null, data: [], teamId: null },
    games: { loading: false, error: null, data: [], teamId: null },

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
            return {...state, auth: { loading: false, error: null, user: null }, teams: { loading: false, error: null, data: [] }, players: { loading: false, error: null, data: [], teamId: null },
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
                players: { loading: false, error: null, data: action.payload.data, teamId: action.payload.teamId },
            };
        case 'FETCH_PLAYERS_FAILURE':
            return { ...state, players: { loading: false, error: action.payload.error, data: [], teamId: state.players.teamId } };

        default:
            return state;
        // Games
        case 'FETCH_GAMES_STARTED':
            return { ...state, games: { ...state.games, loading: true, error: null } };

        case 'FETCH_GAMES_SUCCESS':
            return {
                ...state,
                games: {loading: false, error: null, data: action.payload.data, teamId: action.payload.teamId,
                },
            };

        case 'FETCH_GAMES_FAILURE':
            return {
                ...state,
                games: { loading: false, error: action.payload.error, data: [], teamId: state.games.teamId },
            };

    }
}
