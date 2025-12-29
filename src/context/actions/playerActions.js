import { getPlayersByTeam } from '../../services/api';

export const fetchPlayersStarted = () => ({ type: 'FETCH_PLAYERS_STARTED' });
export const fetchPlayersSuccess = (teamId, data) => ({ type: 'FETCH_PLAYERS_SUCCESS', payload: { teamId, data } });
export const fetchPlayersFailure = (error) => ({ type: 'FETCH_PLAYERS_FAILURE', payload: { error } });

export async function fetchPlayersByTeam(teamId, dispatch) {
    dispatch(fetchPlayersStarted());
    try {
        const data = await getPlayersByTeam(teamId);
        dispatch(fetchPlayersSuccess(teamId, data));
    } catch (e) {
        dispatch(fetchPlayersFailure(e.message || 'Erro a carregar jogadores'));
    }
}
