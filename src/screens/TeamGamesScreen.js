import React, { Component } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button } from 'react-native';
import { AppContext } from '../context/AppContext';
import { fetchGamesByTeam } from '../context/actions/gamesActions';

class TeamGamesScreen extends Component {
    static contextType = AppContext;

    componentDidMount() {
        const team = this.props.route.params?.team;
        if (!team) return;

        const teamId = team._id || team.id;

        this.props.navigation.setOptions({
            title: `Jogos - ${team.name}`,
            headerRight: () => (
                <Button title="+" onPress={() => this.props.navigation.navigate('AddGame', { team })} />
            ),
        });


        fetchGamesByTeam(teamId, this.context.dispatch);

        this.unsubscribe = this.props.navigation.addListener('focus', () => {
            fetchGamesByTeam(teamId, this.context.dispatch);
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

    //  Ordena por data (mais recente primeiro)
    sortByDateDesc = (arr) => {
        return [...arr].sort((a, b) => {
            const da = new Date(String(a.date).substring(0, 10));
            const db = new Date(String(b.date).substring(0, 10));
            return db - da; // recente primeiro
        });
    };

    renderItem = ({ item }) => {
        const team = this.props.route.params?.team;
        const teamName = team?.name || 'Equipa';

        // home=true => a tua equipa está em casa
        const isTeamHome = item.home === true;

        const homeTeamName = isTeamHome ? teamName : item.opponent;
        const awayTeamName = isTeamHome ? item.opponent : teamName;

        const homeGoals = isTeamHome ? item.goals_for : item.goals_against;
        const awayGoals = isTeamHome ? item.goals_against : item.goals_for;

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1.5,
                    borderBottomColor: '#d0d0d0',
                }}
            >
                {/* Casa (esquerda) */}
                <Text
                    style={{ flex: 1, fontSize: 18, fontWeight: '700' }}
                    numberOfLines={1}
                >
                    {homeTeamName}
                </Text>

                {/* Resultado (centro) */}
                <Text style={{ width: 90, textAlign: 'center', fontSize: 18, fontWeight: '700' }}>
                    {homeGoals} × {awayGoals}
                </Text>

                {/* Fora (direita) */}
                <Text
                    style={{ flex: 1, textAlign: 'right', fontSize: 18, fontWeight: '700' }}
                    numberOfLines={1}
                >
                    {awayTeamName}
                </Text>
            </View>
        );
    };

    render() {
        const { loading, error, data } = this.context.state.games;

        if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

        const sorted = this.sortByDateDesc(data);

        return (
            <View style={{ flex: 1, padding: 16 }}>
                {sorted.length === 0 ? (
                    <Text>Sem resultados ainda.</Text>
                ) : (
                    <FlatList
                        data={sorted}
                        keyExtractor={(i) => (i._id || i.id).toString()}
                        renderItem={this.renderItem}
                    />
                )}
            </View>
        );
    }
}

export default TeamGamesScreen;
