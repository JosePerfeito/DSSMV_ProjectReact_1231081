import { getGameStatsByPlayer } from '../../services/api';

export const fetchPlayerStatsStarted = () => ({ type: 'FETCH_PLAYER_STATS_STARTED' });

export const fetchPlayerStatsSuccess = (playerId, data) => ({
    type: 'FETCH_PLAYER_STATS_SUCCESS',
    payload: { playerId, data },
});

export const fetchPlayerStatsFailure = (error) => ({
    type: 'FETCH_PLAYER_STATS_FAILURE',
    payload: { error },
});

export const clearPlayerStats = () => ({ type: 'CLEAR_PLAYER_STATS' });

export async function fetchPlayerStatsByPlayer(playerId, dispatch) {
    dispatch(fetchPlayerStatsStarted());
    try {
        const data = await getGameStatsByPlayer(playerId);
        dispatch(fetchPlayerStatsSuccess(playerId, data));
    } catch (e) {
        dispatch(fetchPlayerStatsFailure(e.message || 'Erro a carregar estatísticas'));
    }
}
