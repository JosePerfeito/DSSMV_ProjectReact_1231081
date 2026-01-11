import React, { Component } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';
import { getGamesByTeam, getGameStatsByGameIds } from '../services/api';
import { fetchGamesByTeam } from '../context/actions/gamesActions';

class TeamStatsScreen extends Component {
    static contextType = AppContext;

    state = {
        loading: true,
        error: null,
        games: [],
        stats: [],
    };

    async componentDidMount() {
        const { dispatch } = this.context;
        const team = this.props.route.params?.team;
        if (!team) return;

        const teamId = team._id || team.id;

        this.props.navigation.setOptions({
            title: `Estatísticas - ${team.name}`,
        });

        try {
            // mantém FLUX atualizado (opcional, mas bom)
            fetchGamesByTeam(teamId, dispatch);

            // para calcular aqui, buscamos direto
            const games = await getGamesByTeam(teamId);
            const gameIds = games.map((g) => g._id || g.id);

            const stats = await getGameStatsByGameIds(gameIds);

            this.setState({ games, stats, loading: false, error: null });
        } catch (e) {
            console.error(e);
            this.setState({ loading: false, error: e.message || 'Erro a carregar estatísticas' });
        }
    }

    // helpers
    fmtPct = (n) => `${(n * 100).toFixed(1).replace('.', ',')}%`;
    fmtNum = (n, decimals = 2) => Number(n).toFixed(decimals).replace('.', ',');

    renderRow(label, value) {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                <Text style={{ fontSize: 18, color: '#444' }}>{label}</Text>
                <Text style={{ fontSize: 18, color: '#444' }}>{value}</Text>
            </View>
        );
    }

    render() {
        const { loading, error, games, stats } = this.state;

        if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ padding: 16 }}>{error}</Text>;

        const totalGames = games.length;

        const wins = games.filter((g) => Number(g.goals_for) > Number(g.goals_against)).length;
        const draws = games.filter((g) => Number(g.goals_for) === Number(g.goals_against)).length;
        const losses = totalGames - wins - draws;

        const goalsFor = games.reduce((acc, g) => acc + (Number(g.goals_for) || 0), 0);
        const goalsAgainst = games.reduce((acc, g) => acc + (Number(g.goals_against) || 0), 0);
        const diff = goalsFor - goalsAgainst;

        const goalsForPerGame = totalGames > 0 ? goalsFor / totalGames : 0;
        const goalsAgainstPerGame = totalGames > 0 ? goalsAgainst / totalGames : 0;

        const yellows = stats.reduce((acc, s) => acc + (Number(s.yellow_cards) || 0), 0);
        const reds = stats.reduce((acc, s) => acc + (s.red_card ? 1 : 0), 0);

        const yellowsPerGame = totalGames > 0 ? yellows / totalGames : 0;
        const redsPerGame = totalGames > 0 ? reds / totalGames : 0;

        const winPct = totalGames > 0 ? wins / totalGames : 0;

        return (
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* RESULTADOS */}
                <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10, color: '#444' }}>
                    Resultados
                </Text>
                {this.renderRow('Jogos:', totalGames)}
                {this.renderRow('Resultados (V/E/D):', `${wins}/${draws}/${losses}`)}
                {this.renderRow('% vitórias:', this.fmtPct(winPct))}

                <View style={{ height: 18 }} />

                {/* GOLOS */}
                <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10, color: '#444' }}>
                    Golos
                </Text>
                {this.renderRow('Marcados:', goalsFor)}
                {this.renderRow('Sofridos:', goalsAgainst)}
                {this.renderRow('Diferença de golos:', diff)}
                {this.renderRow('Marcados / jogo:', this.fmtNum(goalsForPerGame, 2))}
                {this.renderRow('Sofridos / jogo:', this.fmtNum(goalsAgainstPerGame, 2))}

                <View style={{ height: 18 }} />

                {/* DISCIPLINA */}
                <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10, color: '#444' }}>
                    Disciplina
                </Text>
                {this.renderRow('Amarelos:', yellows)}
                {this.renderRow('Vermelhos:', reds)}
                {this.renderRow('Amarelos / jogo:', this.fmtNum(yellowsPerGame, 2))}
                {this.renderRow('Vermelhos / jogo:', this.fmtNum(redsPerGame, 2))}
            </ScrollView>
        );
    }
}

export default TeamStatsScreen;
