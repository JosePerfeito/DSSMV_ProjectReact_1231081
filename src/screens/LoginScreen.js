import React, { Component } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { login } from '../context/actions/authActions';

class LoginScreen extends Component {
    static contextType = AppContext;

    state = { username: '', password: '' };

    handleLogin = async () => {
        const { dispatch } = this.context;
        const { username, password } = this.state;

        const user = await login(username.trim(), password, dispatch);
        if (user) {
            this.props.navigation.replace('Teams');
        } else {
            Alert.alert('Erro', 'Login falhou.');
        }
    };

    render() {
        const { state } = this.context;
        const { username, password } = this.state;

        return (
            <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
                <Text>Username</Text>
                <TextInput value={username} onChangeText={(t) => this.setState({ username: t })} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />

                <Text>Password</Text>
                <TextInput value={password} onChangeText={(t) => this.setState({ password: t })} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />

                {state.auth.loading ? <ActivityIndicator /> : <Button title="Login" onPress={this.handleLogin} />}
                <View style={{ height: 10 }} />
                <Button title="Criar conta" onPress={() => this.props.navigation.navigate('Register')} />
            </View>
        );
    }
    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            this.setState({ username: '', password: '' });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

}

export default LoginScreen;
