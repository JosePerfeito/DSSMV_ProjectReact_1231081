import React, { Component } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { register } from '../context/actions/authActions';

class RegisterScreen extends Component {
    static contextType = AppContext;

    state = { username: '', email: '', password: '', confirm: '' };

    isValidEmail(email) {
        return email.includes('@');
    }

    handleRegister = async () => {
        const { dispatch } = this.context;
        const { username, email, password, confirm } = this.state;

        if (!username || !email || !password || !confirm) {
            Alert.alert('Erro', 'Preenche todos os campos.');
            return;
        }
        if (!this.isValidEmail(email)) {
            Alert.alert('Erro', 'Email inválido.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Erro', 'As passwords não coincidem.');
            return;
        }

        const ok = await register(username.trim(), email.trim(), password, dispatch);
        if (ok) {
            Alert.alert('Sucesso', 'Conta criada!', [{ text: 'OK', onPress: () => this.props.navigation.goBack() }]);
        } else {
            Alert.alert('Erro', 'Não foi possível criar conta.');
        }
    };

    render() {
        const { state } = this.context;
        const { username, email, password, confirm } = this.state;

        return (
            <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
                <Text>Username</Text>
                <TextInput value={username} onChangeText={(t) => this.setState({ username: t })} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />

                <Text>Email</Text>
                <TextInput value={email} onChangeText={(t) => this.setState({ email: t })} keyboardType="email-address" style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />

                <Text>Password</Text>
                <TextInput value={password} onChangeText={(t) => this.setState({ password: t })} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />

                <Text>Confirmar Password</Text>
                <TextInput value={confirm} onChangeText={(t) => this.setState({ confirm: t })} secureTextEntry style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />

                {state.auth.loading ? <ActivityIndicator /> : <Button title="Criar conta" onPress={this.handleRegister} />}
            </View>
        );
    }
}

export default RegisterScreen;
