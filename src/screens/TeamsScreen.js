import React, { Component } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, Button, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { fetchTeamsByUser } from '../context/actions/teamActions';

class TeamsScreen extends Component {
    static contextType = AppContext;

    componentDidMount() {
        const { state, dispatch } = this.context;
        const user = state.auth.user;

        this.props.navigation.setOptions({
            headerLeft: () => null,
            headerRight: () => (
                <View style={{ flexDirection: 'row' }}>
                    <Button title="+" onPress={() => this.props.navigation.navigate('AddTeam')} />
                    <View style={{ width: 8 }} />
                </View>
            ),
        });

        if (user) {
            fetchTeamsByUser(user._id || user.id, dispatch);
        }

        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            const u = this.context.state.auth.user;
            if (u) {
                fetchTeamsByUser(u._id || u.id, this.context.dispatch);
            }
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

    renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Players', { team: item })}
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
                style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    marginRight: 12,
                    backgroundColor: '#eee',
                }}
            />
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
        </TouchableOpacity>
    );

    render() {
        const { loading, error, data } = this.context.state.teams;

        if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

        return (
            <View style={{ flex: 1, padding: 16 }}>
                {data.length === 0 ? (
                    <Text>Não tens equipas ainda.</Text>
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

export default TeamsScreen;
