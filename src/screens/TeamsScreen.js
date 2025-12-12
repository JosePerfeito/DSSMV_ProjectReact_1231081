import React, { Component } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, Alert, Button, Modal, TouchableOpacity,} from 'react-native';
import { getTeamsByUser } from '../services/api';

class TeamsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: [],
            loading: false,
            menuVisible: false,
            selectedTeam: null,
        };
    }

    componentDidMount() {
        const {navigation, route} = this.props;
        const user = route.params?.user;

        if (!user) {
            Alert.alert('Erro', 'Utilizador não encontrado.');
            return;
        }

        const userId = user._id || user.id;

        // carregar uma vez
        this.loadTeams(userId);

        // recarregar sempre que o ecrã ganhar foco
        this.unsubscribeFocus = navigation.addListener('focus', () => {
            this.loadTeams(userId);
        });
        // botão "+" no header
        navigation.setOptions({
            headerRight: () => (
                <Button
                    title="+"
                    onPress={() => navigation.navigate('AddTeam', {user})}
                />
            ),
        });
    }

    componentWillUnmount() {
        if (this.unsubscribeFocus) {
            this.unsubscribeFocus();
        }
    }

    loadTeams = async (userId) => {
        this.setState({loading: true});
        try {
            const data = await getTeamsByUser(userId);
            this.setState({teams: data});
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Não foi possível carregar as equipas.');
        } finally {
            this.setState({loading: false});
        }
    };

    // ---- MENU ----
    openTeamMenu = (team) => {
        this.setState({menuVisible: true, selectedTeam: team});
    };

    closeMenu = () => {
        this.setState({menuVisible: false, selectedTeam: null});
    };

    handleViewTeam = () => {
        const { selectedTeam } = this.state;
        const { navigation, route } = this.props;

        if (!selectedTeam) {
            this.closeMenu();
            return;
        }

        this.closeMenu();

        const user = route.params?.user;

        navigation.navigate('TeamPlayers', {
            team: selectedTeam,
            user,
        });
    };

    handleViewStats = () => {
        const {selectedTeam} = this.state;
        console.log('Ver estatísticas', selectedTeam);
        this.closeMenu();
    };

    handleDeleteTeam = () => {
        const {selectedTeam} = this.state;
        console.log('Apagar equipa', selectedTeam);
        this.closeMenu();
    };

    renderTeamItem = ({item}) => {
        return (
            <TouchableOpacity onPress={() => this.openTeamMenu(item)}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderColor: '#ccc',
                    }}
                >
                    <Image
                        source={{uri: item.image}}
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            marginRight: 12,
                            backgroundColor: '#ddd',
                        }}
                    />
                    <Text style={{fontSize: 18}}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    render() {
        const {teams, loading, menuVisible, selectedTeam} = this.state;

        return (
            <View style={{flex: 1, paddingTop: 16, paddingHorizontal: 16}}>
                {loading ? (
                    <ActivityIndicator/>
                ) : teams.length === 0 ? (
                    <Text>Não tens equipas ainda.</Text>
                ) : (
                    <FlatList
                        data={teams}
                        keyExtractor={(item) => (item._id || item.id).toString()}
                        renderItem={this.renderTeamItem}
                    />
                )}

                {/* MENU EM BAIXO */}
                <Modal
                    visible={menuVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={this.closeMenu}
                >
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            justifyContent: 'flex-end',
                        }}
                        activeOpacity={1}
                        onPress={this.closeMenu} // fecha ao clicar fora
                    >
                        <View
                            style={{
                                backgroundColor: 'white',
                                paddingHorizontal: 16,
                                paddingTop: 16,
                                paddingBottom: 8,
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                            }}
                        >
                            <Text style={{fontSize: 16, marginBottom: 12}}>
                                {selectedTeam ? selectedTeam.name : 'Opções'}
                            </Text>

                            <TouchableOpacity
                                style={{paddingVertical: 10}}
                                onPress={this.handleViewTeam}
                            >
                                <Text style={{fontSize: 16}}>Ver equipa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{paddingVertical: 10}}
                                onPress={this.handleViewStats}
                            >
                                <Text style={{fontSize: 16}}>Ver estatísticas de equipa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{paddingVertical: 10}}
                                onPress={this.handleDeleteTeam}
                            >
                                <Text style={{fontSize: 16, color: 'red'}}>
                                    Apagar equipa
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{paddingVertical: 10, marginTop: 4}}
                                onPress={this.closeMenu}
                            >
                                <Text style={{fontSize: 16, textAlign: 'center'}}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        );
    }
}
export default TeamsScreen;
