import { getTeamsByUser } from '../../services/api';

export const fetchTeamsStarted = () => ({ type: 'FETCH_TEAMS_STARTED' });
export const fetchTeamsSuccess = (data) => ({ type: 'FETCH_TEAMS_SUCCESS', payload: { data } });
export const fetchTeamsFailure = (error) => ({ type: 'FETCH_TEAMS_FAILURE', payload: { error } });

export async function fetchTeamsByUser(userId, dispatch) {
    dispatch(fetchTeamsStarted());
    try {
        const data = await getTeamsByUser(userId);
        dispatch(fetchTeamsSuccess(data));
    } catch (e) {
        dispatch(fetchTeamsFailure(e.message || 'Erro a carregar equipas'));
    }
}
