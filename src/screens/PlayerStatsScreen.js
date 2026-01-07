import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import { fetchPlayerStatsByPlayer, clearPlayerStats } from '../context/actions/playerStatsActions';

class PlayerStatsScreen extends Component {
    static contextType = AppContext;

    componentDidMount() {
        const { dispatch } = this.context;
        const player = this.props.route.params?.player;
        if (!player) return;

        const playerId = player._id || player.id;

        this.props.navigation.setOptions({
            title: `Estatísticas - ${player.name}`,
        });

        fetchPlayerStatsByPlayer(playerId, dispatch);
    }

    componentWillUnmount() {
        this.context.dispatch(clearPlayerStats());
    }

    render() {
        const { loading, error, data } = this.context.state.playerStats;

        if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

        const safeData = Array.isArray(data) ? data : [];

        const gamesSet = new Set(safeData.map((s) => s.id_game));
        const games = gamesSet.size;

        const sum = (field) =>
            safeData.reduce((acc, s) => acc + (Number(s?.[field]) || 0), 0);

        const totalGoals = sum('goals');
        const totalAssists = sum('assists');
        const totalYellows = sum('yellow_cards');
        const totalReds = safeData.reduce((acc, s) => acc + (s?.red_card ? 1 : 0), 0);

        const perGame = (val) =>
            games > 0 ? (val / games).toFixed(2).replace('.', ',') : '0,00';

        return (
            <View style={{ flex: 1, padding: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                    Totais
                </Text>

                <Text>Jogos: {games ?? 0}</Text>
                <Text>Golos: {totalGoals ?? 0}</Text>
                <Text>Assistências: {totalAssists ?? 0}</Text>
                <Text>Cartões amarelos: {totalYellows ?? 0}</Text>
                <Text>Cartões vermelhos: {totalReds ?? 0}</Text>

                <View style={{ height: 18 }} />

                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                    Por jogo
                </Text>

                <Text>Golos / jogo: {perGame(totalGoals)}</Text>
                <Text>Assistências / jogo: {perGame(totalAssists)}</Text>
                <Text>Amarelos / jogo: {perGame(totalYellows)}</Text>
                <Text>Vermelhos / jogo: {perGame(totalReds)}</Text>
            </View>
        );
    }
}

export default PlayerStatsScreen;
