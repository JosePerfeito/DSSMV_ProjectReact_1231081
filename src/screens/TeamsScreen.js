import React, { Component } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, Alert, Button } from 'react-native';
import { getTeamsByUser } from '../services/api';

class TeamsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: [],
            loading: false,
        };
    }

    componentDidMount() {
        const { navigation, route } = this.props;
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

        navigation.setOptions({
            headerRight: () => (
                <Button
                    title="+"
                    onPress={() => navigation.navigate('AddTeam', { user })}
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
        this.setState({ loading: true });
        try {
            const data = await getTeamsByUser(userId);
            this.setState({ teams: data });
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Não foi possível carregar as equipas.');
        } finally {
            this.setState({ loading: false });
        }
    };

    renderTeamItem = ({ item }) => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                }}
            >
                <Image
                    source={{ uri: item.image }}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        marginRight: 12,
                        backgroundColor: '#ddd',
                    }}
                />
                <Text style={{ fontSize: 18 }}>{item.name}</Text>
            </View>
        );
    };

    render() {
        const { teams, loading } = this.state;

        return (
            <View style={{ flex: 1, paddingTop: 16, paddingHorizontal: 16 }}>
                {loading ? (
                    <ActivityIndicator />
                ) : teams.length === 0 ? (
                    <Text>Não tens equipas ainda.</Text>
                ) : (
                    <FlatList
                        data={teams}
                        keyExtractor={(item) => (item._id || item.id).toString()}
                        renderItem={this.renderTeamItem}
                    />
                )}
            </View>
        );
    }
}
export default TeamsScreen;
