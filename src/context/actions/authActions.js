import { loginApi, registerApi, existsUsername, existsEmail } from '../../services/api';

export const loginStarted = () => ({ type: 'LOGIN_STARTED' });
export const loginSuccess = (user) => ({ type: 'LOGIN_SUCCESS', payload: { user } });
export const loginFailure = (error) => ({ type: 'LOGIN_FAILURE', payload: { error } });
export const logout = () => ({ type: 'LOGOUT' });


export async function login(username, password, dispatch) {
    dispatch(loginStarted());
    try {
        const user = await loginApi(username, password);
        dispatch(loginSuccess(user));
        return user;
    } catch (e) {
        dispatch(loginFailure(e.message || 'Erro no login'));
        return null;
    }
}

export const registerStarted = () => ({ type: 'REGISTER_STARTED' });
export const registerSuccess = () => ({ type: 'REGISTER_SUCCESS' });
export const registerFailure = (error) => ({ type: 'REGISTER_FAILURE', payload: { error } });

export async function register(username, email, password, dispatch) {
    dispatch(registerStarted());
    try {
        if (await existsUsername(username)) throw new Error('Username já existe.');
        if (await existsEmail(email)) throw new Error('Email já existe.');

        await registerApi(username, email, password);
        dispatch(registerSuccess());
        return true;
    } catch (e) {
        dispatch(registerFailure(e.message || 'Erro no registo'));
        return false;
    }
}
