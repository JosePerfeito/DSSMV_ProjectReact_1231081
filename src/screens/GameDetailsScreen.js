import React, { Component } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { getGameStatsByGame, getPlayersByTeam } from '../services/api';

class GameDetailsScreen extends Component {
    state = {
        loading: true,
        stats: [],
        playersMap: {},
        error: null,
    };

    async componentDidMount() {
        const { team, game } = this.props.route.params || {};
        if (!team || !game) {
            this.setState({ loading: false, error: 'Dados do jogo em falta.' });
            return;
        }

        const teamId = team._id || team.id;
        const gameId = game._id || game.id;

        // título: "Jogo - Adversário"
        this.props.navigation.setOptions({
            title: `Jogo - ${game.opponent || ''}`.trim(),
        });

        try {
            const [players, stats] = await Promise.all([
                getPlayersByTeam(teamId),
                getGameStatsByGame(gameId),
            ]);

            const playersMap = {};
            (players || []).forEach((p) => {
                const pid = p._id || p.id;
                playersMap[pid] = p;
            });

            this.setState({ playersMap, stats: stats || [], loading: false });
        } catch (e) {
            console.error(e);
            this.setState({ loading: false, error: 'Não foi possível carregar detalhes do jogo.' });
        }
    }

    // util: devolve "Nome" a partir do id_player
    nameOf = (playerId) => {
        const p = this.state.playersMap[playerId];
        return p?.name || '(Jogador)';
    };

    // lista "a, b, c" ou "—"
    renderListLine = (namesArr) => {
        if (!namesArr || namesArr.length === 0) return '—';
        return namesArr.join(', ');
    };

    // Agrupa por contagem (golos/assistências)
    // Retorna array ["Pedro (3)", "Foti (1)"] -> sem "(1)" se quiseres
    renderCountList = (items) => {
        if (!items || items.length === 0) return '—';

        const parts = items.map(({ name, count }) => (count > 1 ? `${name} (${count})` : name));
        return parts.join(', ');
    };

    build = () => {
        const { stats } = this.state;

        // starters e subs
        const starters = [];
        const subs = [];

        // totals
        const goalsList = [];
        const assistsList = [];
        const yellows = [];
        const reds = [];

        for (const s of stats) {
            const playerId = s.id_player;
            const name = this.nameOf(playerId);

            if (s.starter === true) starters.push(name);
            else subs.push(name);

            const g = Number(s.goals || 0);
            const a = Number(s.assists || 0);
            const y = Number(s.yellow_cards || 0);

            if (g > 0) goalsList.push({ name, count: g });
            if (a > 0) assistsList.push({ name, count: a });

            if (y > 0) yellows.push(name); // na imagem só lista nomes
            if (s.red_card === true) reds.push(name);
        }

        // ordenar alfabeticamente (opcional — fica mais limpo)
        starters.sort((x, y) => x.localeCompare(y));
        subs.sort((x, y) => x.localeCompare(y));
        yellows.sort((x, y) => x.localeCompare(y));
        reds.sort((x, y) => x.localeCompare(y));

        // para golos/assists: ordena desc por count
        goalsList.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        assistsList.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        return { starters, subs, goalsList, assistsList, yellows, reds };
    };

    render() {
        const { loading, error } = this.state;

        if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

        const { starters, subs, goalsList, assistsList, yellows, reds } = this.build();

        return (
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Titulares:</Text>
                <Text style={{ fontSize: 16, marginBottom: 16 }}>{this.renderListLine(starters)}</Text>

                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Suplentes utilizados:</Text>
                <Text style={{ fontSize: 16, marginBottom: 16 }}>{this.renderListLine(subs)}</Text>

                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Golos:</Text>
                <Text style={{ fontSize: 16, marginBottom: 16 }}>{this.renderCountList(goalsList)}</Text>

                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Assistências:</Text>
                <Text style={{ fontSize: 16, marginBottom: 16 }}>{this.renderCountList(assistsList)}</Text>

                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Cartões amarelos:</Text>
                <Text style={{ fontSize: 16, marginBottom: 16 }}>{this.renderListLine(yellows)}</Text>

                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Cartões vermelhos:</Text>
                <Text style={{ fontSize: 16 }}>{this.renderListLine(reds)}</Text>
            </ScrollView>
        );
    }
}

export default GameDetailsScreen;
