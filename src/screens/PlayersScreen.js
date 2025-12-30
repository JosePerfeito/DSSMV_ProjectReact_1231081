import React, { Component } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import { AppContext } from '../context/AppContext';
import { fetchPlayersByTeam } from '../context/actions/playerActions';

function calcAge(value) {
    if (!value) return null;

    // Aceita Date ou string
    let dob;

    if (value instanceof Date) {
        dob = value;
    } else if (typeof value === 'string') {
        // Se vier ISO: "1994-02-07T00:00:00.000Z", corta para "1994-02-07"
        const normalized = value.length >= 10 ? value.substring(0, 10) : value;
        dob = new Date(normalized);
    } else {
        return null;
    }

    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

    if (age < 0) return null;

    return age;
}

class PlayersScreen extends Component {
    static contextType = AppContext;

    componentDidMount() {
        const team = this.props.route.params?.team;
        if (!team) return;

        const teamId = team._id || team.id;

        this.props.navigation.setOptions({
            title: team.name,
            headerRight: () => (
                <Button title="+" onPress={() => this.props.navigation.navigate('AddPlayer', { team })} />
            ),
        });

        fetchPlayersByTeam(teamId, this.context.dispatch);

        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            fetchPlayersByTeam(teamId, this.context.dispatch);
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

    renderItem = ({ item }) => {
        const age = calcAge(item.birthday);

        return (
            <TouchableOpacity
                style={{
                    paddingVertical: 10,
                    borderBottomWidth: 2,
                    borderBottomColor: '#9e9e9e',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <Image
                    source={{ uri: item.photo }}
                    style={{
                        width: 54,
                        height: 54,
                        borderRadius: 10,
                        marginRight: 12,
                        backgroundColor: '#eee',
                    }}
                />

                <View>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>
                        {item.name} nº {item.number}
                    </Text>

                    <Text style={{ color: '#555' }}>
                        {age !== null ? `${age} anos` : ''}{age !== null ? ' · ' : ''}{item.position}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    render() {
        const { loading, error, data } = this.context.state.players;

        if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

        return (
            <View style={{ flex: 1, padding: 16 }}>
                {data.length === 0 ? (
                    <Text>Sem jogadores.</Text>
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(i) => (i._id || i.id).toString()}
                        renderItem={this.renderItem}
                    />
                )}
            </View>
        );
    }
}

export default PlayersScreen;
