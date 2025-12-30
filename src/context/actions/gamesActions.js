import { getGamesByTeam } from '../../services/api';

export const fetchGamesStarted = () => ({ type: 'FETCH_GAMES_STARTED' });
export const fetchGamesSuccess = (teamId, data) => ({
    type: 'FETCH_GAMES_SUCCESS',
    payload: { teamId, data },
});
export const fetchGamesFailure = (error) => ({
    type: 'FETCH_GAMES_FAILURE',
    payload: { error },
});

export async function fetchGamesByTeam(teamId, dispatch) {
    dispatch(fetchGamesStarted());
    try {
        const data = await getGamesByTeam(teamId);
        dispatch(fetchGamesSuccess(teamId, data));
    } catch (e) {
        dispatch(fetchGamesFailure(e.message || 'Erro a carregar jogos'));
    }
}
