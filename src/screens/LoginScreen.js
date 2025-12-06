import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { loginApi } from '../services/api';

class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loading: false,
            loggedUser: null,
        };
    }

    handleChangeUsername = (text) => {
        this.setState({ username: text });
    };

    handleChangePassword = (text) => {
        this.setState({ password: text });
    };

    handleLogin = async () => {
        const { username, password } = this.state;

        if (!username || !password) {
            Alert.alert('Erro', 'Preenche nome e password.');
            return;
        }

        this.setState({ loading: true });

        try {
            const user = await loginApi(username, password);
            this.setState({ loggedUser: user });
            Alert.alert('Login', `Bem-vindo, ${user.username || 'utilizador'}!`);

            // Aqui navegamos para a screen das equipas
            this.props.navigation.navigate('Teams', { user });
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Login falhou. Verifica as credenciais.');
        } finally {
            this.setState({ loading: false });
        }
    };

    goToRegister = () => {
        this.props.navigation.navigate('Register');
    };

    render() {
        const { username, password, loading, loggedUser } = this.state;

        return (
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                    Football Management
                </Text>

                <Text>Nome</Text>
                <TextInput
                    value={username}
                    onChangeText={this.handleChangeUsername}
                    autoCapitalize="none"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 8,
                        marginBottom: 12,
                    }}
                />

                <Text>Password</Text>
                <TextInput
                    value={password}
                    onChangeText={this.handleChangePassword}
                    secureTextEntry
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 8,
                        marginBottom: 16,
                    }}
                />

                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <>
                        <Button title="Entrar" onPress={this.handleLogin} />
                        <View style={{ height: 10 }} />
                        <Button title="Criar conta" onPress={this.goToRegister} />
                    </>
                )}

                {loggedUser && (
                    <Text style={{ marginTop: 20, textAlign: 'center' }}>
                        Login efetuado como: {loggedUser.username}
                    </Text>
                )}
            </View>
        );
    }
}
export default LoginScreen;
