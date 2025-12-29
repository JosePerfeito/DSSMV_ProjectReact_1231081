import React, { Component } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import { AppContext } from '../context/AppContext';
import { fetchPlayersByTeam } from '../context/actions/playerActions';

function calcAge(yyyy_mm_dd) {
    const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
    const dob = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const mm = today.getMonth() - dob.getMonth();
    if (mm < 0 || (mm === 0 && today.getDate() < dob.getDate())) age--;
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
            headerRight: () => <Button title="+" onPress={() => this.props.navigation.navigate('AddPlayer', { team })} />,
        });

        fetchPlayersByTeam(teamId, this.context.dispatch);

        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            fetchPlayersByTeam(teamId, this.context.dispatch);
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

    renderItem = ({ item }) => (
        <TouchableOpacity
            style={{
                paddingVertical: 10,
                borderBottomWidth: 2,
                borderBottomColor: '#9e9e9e',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Image source={{ uri: item.photo }} style={{ width: 54, height: 54, borderRadius: 10, marginRight: 12, backgroundColor: '#eee' }} />
            <View>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name} nº {item.number}</Text>
                <Text style={{ color: '#555' }}>{calcAge(item.birthday)} anos · {item.position}</Text>
            </View>
        </TouchableOpacity>
    );

    render() {
        const { loading, error, data } = this.context.state.players;

        if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

        return (
            <View style={{ flex: 1, padding: 16 }}>
                {data.length === 0 ? <Text>Sem jogadores.</Text> : (
                    <FlatList data={data} keyExtractor={(i) => (i._id || i.id).toString()} renderItem={this.renderItem} />
                )}
            </View>
        );
    }
}

export default PlayersScreen;
