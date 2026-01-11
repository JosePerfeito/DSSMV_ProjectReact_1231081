import React, { Component } from 'react';
import {View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, Button, Modal, Alert, Pressable,} from 'react-native';
import { AppContext } from '../context/AppContext';
import { fetchTeamsByUser } from '../context/actions/teamActions';
import { logout } from '../context/actions/authActions';
import { deleteTeamCascade, deleteUserApi } from '../services/api';

class TeamsScreen extends Component {
    static contextType = AppContext;

    state = {
        // menu da equipa (já tinhas)
        menuVisible: false,
        selectedTeam: null,

        // menu da conta (NOVO)
        accountMenuVisible: false,
    };

    componentDidMount() {
        const { state, dispatch } = this.context;
        const user = state.auth.user;

        this.props.navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* ⋮ (3 pontos) à esquerda do + */}
                    <TouchableOpacity
                        onPress={() => this.setState({ accountMenuVisible: true })}
                        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={{ fontSize: 22, fontWeight: '700' }}>⋮</Text>
                    </TouchableOpacity>

                    <Button title="+" onPress={() => this.props.navigation.navigate('AddTeam')} />
                </View>
            ),
        });


        if (user) fetchTeamsByUser(user._id || user.id, dispatch);

        this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
            const u = this.context.state.auth.user;
            if (u) fetchTeamsByUser(u._id || u.id, this.context.dispatch);
        });
    }

    componentWillUnmount() {
        if (this.unsubscribeFocus) this.unsubscribeFocus();
    }

    // ---------- MENU EQUIPA ----------
    openMenu = (team) => this.setState({ menuVisible: true, selectedTeam: team });
    closeMenu = () => this.setState({ menuVisible: false, selectedTeam: null });

    handleViewTeam = () => {
        const { selectedTeam } = this.state;
        if (!selectedTeam) return;
        this.closeMenu();
        this.props.navigation.navigate('Players', { team: selectedTeam });
    };

    handleViewStats = () => {
        const { selectedTeam } = this.state;
        if (!selectedTeam) return;
        this.closeMenu();
        this.props.navigation.navigate('TeamStats', { team: selectedTeam });
    };

    handleDeleteTeam = () => {
        const { selectedTeam } = this.state;
        const user = this.context.state.auth.user;
        if (!selectedTeam || !user) return;

        Alert.alert(
            'Apagar equipa',
            `Tens a certeza que queres apagar "${selectedTeam.name}"?\n\nIsto vai apagar também jogadores e jogos.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            this.closeMenu();
                            await deleteTeamCascade(selectedTeam);
                            await fetchTeamsByUser(user._id || user.id, this.context.dispatch);
                            Alert.alert('OK', 'Equipa apagada com sucesso.');
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Erro', 'Não foi possível apagar a equipa.');
                        }
                    },
                },
            ]
        );
    };

    // ---------- MENU CONTA (NOVO) ----------
    closeAccountMenu = () => this.setState({ accountMenuVisible: false });

    handleDeleteAccount = () => {
        const { state, dispatch } = this.context;
        const user = state.auth.user;
        if (!user) return;

        Alert.alert(
            'Apagar conta',
            'Tens a certeza?\n\nIsto vai apagar todas as tuas equipas, jogadores e jogos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            this.closeAccountMenu();

                            const userId = user._id || user.id;

                            // usar o que já tens no FLUX
                            const teams = this.context.state.teams.data || [];

                            // apagar tudo em cascata (equipa por equipa)
                            for (const t of teams) {
                                await deleteTeamCascade(t);
                            }

                            // apagar o user
                            await deleteUserApi(userId);

                            // limpar estado + ir para login
                            dispatch(logout());
                            this.props.navigation.replace('Login');

                            Alert.alert('OK', 'Conta apagada com sucesso.');
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Erro', 'Não foi possível apagar a conta.');
                        }
                    },
                },
            ]
        );
    };

    renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => this.openMenu(item)}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 2,
                borderBottomColor: '#9e9e9e',
            }}
        >
            <Image
                source={{ uri: item.image }}
                style={{ width: 54, height: 54, borderRadius: 27, marginRight: 12, backgroundColor: '#eee' }}
            />
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
        </TouchableOpacity>
    );

    render() {
        const { loading, error, data } = this.context.state.teams;
        const { menuVisible, selectedTeam, accountMenuVisible } = this.state;

        if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

        return (
            <View style={{ flex: 1, padding: 16 }}>
                {data.length === 0 ? (
                    <Text>Não tens equipas ainda.</Text>
                ) : (
                    <FlatList data={data} keyExtractor={(i) => (i._id || i.id).toString()} renderItem={this.renderItem} />
                )}

                {/* MENU EQUIPA (já tinhas) */}
                <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={this.closeMenu}>
                    <Pressable
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
                        onPress={this.closeMenu}
                    >
                        <Pressable
                            style={{
                                backgroundColor: 'white',
                                paddingHorizontal: 16,
                                paddingTop: 16,
                                paddingBottom: 8,
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                            }}
                            onPress={() => {}}
                        >
                            <Text style={{ fontSize: 16, marginBottom: 12 }}>{selectedTeam ? selectedTeam.name : 'Opções'}</Text>

                            <TouchableOpacity style={{ paddingVertical: 10 }} onPress={this.handleViewTeam}>
                                <Text style={{ fontSize: 16 }}>Ver equipa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ paddingVertical: 10 }} onPress={this.handleViewStats}>
                                <Text style={{ fontSize: 16 }}>Ver estatísticas de equipa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ paddingVertical: 10 }} onPress={this.handleDeleteTeam}>
                                <Text style={{ fontSize: 16, color: 'red' }}>Apagar equipa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ paddingVertical: 10, marginTop: 4 }} onPress={this.closeMenu}>
                                <Text style={{ fontSize: 16, textAlign: 'center' }}>Cancelar</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* MENU CONTA (NOVO) */}
                <Modal visible={accountMenuVisible} transparent animationType="fade" onRequestClose={this.closeAccountMenu}>
                    <Pressable
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-start' }}
                        onPress={this.closeAccountMenu}
                    >
                        <Pressable
                            style={{
                                marginTop: 56,
                                marginRight: 16,
                                marginLeft: 'auto',
                                backgroundColor: '#fff',
                                borderRadius: 10,
                                paddingVertical: 6,
                                minWidth: 180,
                                elevation: 4,
                            }}
                            onPress={() => {}}
                        >
                            <TouchableOpacity onPress={this.handleDeleteAccount} style={{ paddingVertical: 12, paddingHorizontal: 14 }}>
                                <Text style={{ fontSize: 16, color: 'red', fontWeight: '700' }}>Apagar conta</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </Modal>
            </View>
        );
    }
}

export default TeamsScreen;
