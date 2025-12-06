// src/screens/RegisterScreen.js
import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
} from 'react-native';
import { registerUserApi, findUserByNameOrEmail } from '../services/api';

class RegisterScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            loading: false,
        };
    }

    handleChange = (field, value) => {
        this.setState({ [field]: value });
    };

    isValidEmail = (email) => {
        // Validação simples de email: tem @ e domínio
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    handleRegister = async () => {
        const { username, email, password, confirmPassword } = this.state;

        // 1) Campos obrigatórios
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Erro', 'Preenche todos os campos.');
            return;
        }

        // 2) Email válido
        if (!this.isValidEmail(email)) {
            Alert.alert('Erro', 'Introduz um email válido (ex: nome@dominio.com).');
            return;
        }

        // 3) Passwords iguais
        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As passwords não coincidem.');
            return;
        }

        this.setState({ loading: true });

        try {
            // 4) Verificar se já existe utilizador com o mesmo username OU email
            const existingUsers = await findUserByNameOrEmail(username, email);

            const usernameTaken = existingUsers.some((u) => u.username === username);
            const emailTaken = existingUsers.some((u) => u.email === email);

            if (usernameTaken || emailTaken) {
                let msg = 'Já existe um utilizador com:';
                if (usernameTaken) msg += '\n- esse username';
                if (emailTaken) msg += '\n- esse email';
                Alert.alert('Erro', msg);
                this.setState({ loading: false });
                return;
            }

            // 5) Criar utilizador
            await registerUserApi(username, email, password);

            Alert.alert('Conta criada', 'Já podes fazer login.', [
                {
                    text: 'OK',
                    onPress: () => {
                        this.setState({
                            username: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                            loading: false,
                        });
                        this.props.navigation.goBack();
                    },
                },
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Não foi possível criar a conta.');
            this.setState({ loading: false });
        }
    };

    render() {
        const { username, email, password, confirmPassword, loading } = this.state;

        return (
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                    Criar conta
                </Text>

                <Text>Nome</Text>
                <TextInput
                    value={username}
                    onChangeText={(text) => this.handleChange('username', text)}
                    autoCapitalize="none"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 8,
                        marginBottom: 12,
                    }}
                />

                <Text>Email</Text>
                <TextInput
                    value={email}
                    onChangeText={(text) => this.handleChange('email', text)}
                    keyboardType="email-address"
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
                    onChangeText={(text) => this.handleChange('password', text)}
                    secureTextEntry
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 8,
                        marginBottom: 12,
                    }}
                />

                <Text>Confirmar password</Text>
                <TextInput
                    value={confirmPassword}
                    onChangeText={(text) =>
                        this.handleChange('confirmPassword', text)
                    }
                    secureTextEntry
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 8,
                        marginBottom: 16,
                    }}
                />

                {loading ? (
                    <Text>A criar conta...</Text>
                ) : (
                    <Button title="Criar conta" onPress={this.handleRegister} />
                )}
            </View>
        );
    }
}

export default RegisterScreen;
