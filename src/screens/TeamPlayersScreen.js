import React, { Component } from 'react';
import {View, Text, FlatList, Image, ActivityIndicator, Alert, Button} from 'react-native';
import { getPlayersByTeam } from '../services/api';

class TeamPlayersScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: [],
            loading: false,
        };
    }

    componentDidMount() {
        const { route, navigation } = this.props;
        const team = route.params?.team;

        if (!team) {
            Alert.alert('Erro', 'Equipa não encontrada.');
            return;
        }

        const teamId = team.id || team._id;

        // título e botão +
        navigation.setOptions({
            title: team.name || 'Jogadores',
            headerRight: () => (
                <Button
                    title="+"
                    onPress={() => navigation.navigate('AddPlayer', { team })}
                />
            ),
        });

        // carregar uma vez
        this.loadPlayers(teamId);

        // recarregar quando volta para este ecrã
        this.unsubscribeFocus = navigation.addListener('focus', () => {
            this.loadPlayers(teamId);
        });
    }

    componentWillUnmount() {
        if (this.unsubscribeFocus) {
            this.unsubscribeFocus();
        }
    }

    loadPlayers = async (teamId) => {
        this.setState({ loading: true });
        try {
            const data = await getPlayersByTeam(teamId);
            this.setState({ players: data });
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Não foi possível carregar os jogadores.');
        } finally {
            this.setState({ loading: false });
        }
    };

    // calcula idade a partir da data YYYY-MM-DD
    calculateAge = (birthdayStr) => {
        if (!birthdayStr) return '-';
        const birthDate = new Date(birthdayStr);
        if (isNaN(birthDate.getTime())) return '-';

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return age;
    };

    renderPlayerItem = ({ item }) => {
        const age = this.calculateAge(item.birthday);

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderColor: '#ccc',
                }}
            >
                <Image
                    source={{ uri: item.photo }}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        marginRight: 12,
                        backgroundColor: '#ddd',
                    }}
                />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {item.name} nº {item.number}
                    </Text>
                    <Text>Posição: {item.position}</Text>
                    <Text>Idade: {age} anos</Text>
                </View>
            </View>
        );
    };

    render() {
        const { players, loading } = this.state;

        return (
            <View style={{ flex: 1, paddingTop: 16, paddingHorizontal: 16 }}>
                {loading ? (
                    <ActivityIndicator />
                ) : players.length === 0 ? (
                    <Text>Esta equipa ainda não tem jogadores.</Text>
                ) : (
                    <FlatList
                        data={players}
                        keyExtractor={(item) => (item._id || item.id).toString()}
                        renderItem={this.renderPlayerItem}
                    />
                )}
            </View>
        );
    }
}

export default TeamPlayersScreen;
