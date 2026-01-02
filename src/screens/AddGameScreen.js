import React, { Component } from 'react';
import {View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch, Button,} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getPlayersByTeam, createGameApi, createGameStatApi } from '../services/api';
import { AppContext } from '../context/AppContext';
import { fetchGamesByTeam } from '../context/actions/gamesActions';

class AddGameScreen extends Component {
    static contextType = AppContext;

    state = {
        loadingPlayers: true,
        saving: false,

        dateObj: new Date(),
        showDatePicker: false,
        opponent: '',
        goalsFor: '0',
        goalsAgainst: '0',
        home: true,

        players: [],
        selected: {},
    };

    async componentDidMount() {
        const team = this.props.route.params?.team;
        if (!team) return;

        const teamId = team._id || team.id;

        try {
            const players = await getPlayersByTeam(teamId);
            this.setState({ players, loadingPlayers: false });
        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Não foi possível carregar jogadores.');
            this.setState({ loadingPlayers: false });
        }
    }

    formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    isFutureDate = (dateObj) => {
        const d = new Date(dateObj);
        d.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return d > today;
    };

    toIntSafe = (v) => {
        const n = parseInt(String(v), 10);
        return isNaN(n) ? 0 : n;
    };

    toggleUsePlayer = (playerId) => {
        this.setState((prev) => {
            const current = prev.selected[playerId];
            if (current) {
                const copy = { ...prev.selected };
                delete copy[playerId];
                return { selected: copy };
            }
            return {
                selected: {
                    ...prev.selected,
                    [playerId]: {
                        starter: false,
                        goals: '0',
                        assists: '0',
                        yellow: '0',
                        red: false,
                    },
                },
            };
        });
    };

    toggleStarter = (playerId) => {
        this.setState((prev) => {
            const cur = prev.selected[playerId];
            if (!cur) return null;
            return {
                selected: {
                    ...prev.selected,
                    [playerId]: { ...cur, starter: !cur.starter },
                },
            };
        });
    };

    setStat = (playerId, field, value) => {
        this.setState((prev) => {
            const cur = prev.selected[playerId];
            if (!cur) return null;

            let next = { ...cur, [field]: value };

            if (field === 'yellow') {
                let y = parseInt(String(value), 10);
                if (isNaN(y)) y = 0;
                if (y < 0) y = 0;
                if (y > 2) y = 2;

                next.yellow = String(y);

                // 2 amarelos => vermelho
                if (y === 2) next.red = true;
            }

            return {
                selected: {
                    ...prev.selected,
                    [playerId]: next,
                },
            };
        });
    };

    countStartersAndSubs = () => {
        const { selected } = this.state;
        let starters = 0;
        let subsUsed = 0;

        Object.values(selected).forEach((s) => {
            if (s.starter) starters++;
            else subsUsed++;
        });

        return { starters, subsUsed };
    };

    sumTeamStats = () => {
        const { selected } = this.state;
        let goals = 0;
        let assists = 0;

        Object.values(selected).forEach((s) => {
            goals += this.toIntSafe(s.goals);
            assists += this.toIntSafe(s.assists);
        });

        return { goals, assists };
    };

    validate = () => {
        const { opponent, goalsFor, goalsAgainst, selected, dateObj } = this.state;

        if (!opponent.trim()) {
            Alert.alert('Erro', 'Preenche o adversário.');
            return false;
        }

        if (this.isFutureDate(dateObj)) {
            Alert.alert('Erro', 'A data do jogo não pode ser futura.');
            return false;
        }

        const gf = this.toIntSafe(goalsFor);
        const ga = this.toIntSafe(goalsAgainst);

        if (gf < 0 || ga < 0) {
            Alert.alert('Erro', 'Os golos não podem ser negativos.');
            return false;
        }

        const selectedIds = Object.keys(selected);
        if (selectedIds.length === 0) {
            Alert.alert('Erro', 'Seleciona jogadores (titulares e/ou suplentes usados).');
            return false;
        }

        const { starters, subsUsed } = this.countStartersAndSubs();

        if (starters < 7) {
            Alert.alert('Erro', 'Tens de ter pelo menos 7 titulares.');
            return false;
        }

        if (starters > 11) {
            Alert.alert('Erro', 'Não podes ter mais de 11 titulares.');
            return false;
        }

        if (subsUsed > 5) {
            Alert.alert('Erro', 'Só podes usar no máximo 5 suplentes.');
            return false;
        }

        for (const pid of selectedIds) {
            const s = selected[pid];
            const g = this.toIntSafe(s.goals);
            const a = this.toIntSafe(s.assists);
            const y = this.toIntSafe(s.yellow);

            if (g < 0 || a < 0 || y < 0) {
                Alert.alert('Erro', 'Golos/Assistências/Amarelos não podem ser negativos.');
                return false;
            }
            if (y > 2) {
                Alert.alert('Erro', 'Um jogador não pode ter mais de 2 amarelos.');
                return false;
            }
        }

        const sums = this.sumTeamStats();
        if (sums.goals > gf) {
            Alert.alert('Erro', 'A soma dos golos dos jogadores não pode ser maior que "golos a favor".');
            return false;
        }
        if (sums.assists > gf) {
            Alert.alert('Erro', 'A soma das assistências não pode ser maior que "golos a favor".');
            return false;
        }

        return true;
    };

    handleSave = async () => {
        if (!this.validate()) return;

        const team = this.props.route.params?.team;
        const teamId = team._id || team.id;

        const { dateObj, opponent, goalsFor, goalsAgainst, home, selected } = this.state;

        try {
            this.setState({ saving: true });

            const game = await createGameApi(
                teamId,
                this.formatDate(dateObj),
                opponent.trim(),
                this.toIntSafe(goalsFor),
                this.toIntSafe(goalsAgainst),
                home
            );

            const gameId = game._id || game.id;

            const selectedIds = Object.keys(selected);

            await Promise.all(
                selectedIds.map((pid) => {
                    const s = selected[pid];
                    return createGameStatApi(
                        gameId,
                        pid,
                        s.starter === true,
                        this.toIntSafe(s.goals),
                        this.toIntSafe(s.assists),
                        this.toIntSafe(s.yellow),
                        s.red === true
                    );
                })
            );

            await fetchGamesByTeam(teamId, this.context.dispatch);

            this.setState({ saving: false });
            this.props.navigation.goBack();
        } catch (e) {
            console.error(e);
            this.setState({ saving: false });
            Alert.alert('Erro', 'Não foi possível guardar o jogo.');
        }
    };

    renderPlayerRow = (p) => {
        const playerId = p._id || p.id;
        const s = this.state.selected[playerId];
        const isSelected = !!s;

        return (
            <View
                key={playerId}
                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}
            >
                <TouchableOpacity onPress={() => this.toggleUsePlayer(playerId)}>
                    <Text style={{ fontSize: 16, fontWeight: '700' }}>
                        {isSelected ? '✅ ' : '⬜ '} {p.name} nº {p.number}
                    </Text>
                </TouchableOpacity>

                {isSelected && (
                    <View style={{ marginTop: 8, paddingLeft: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ marginRight: 8 }}>Titular</Text>
                            <Switch value={s.starter} onValueChange={() => this.toggleStarter(playerId)} />
                            <Text style={{ marginLeft: 12, color: '#555' }}>
                                {s.starter ? '(Titular)' : '(Suplente usado)'}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                                <Text>Golos</Text>
                                <TextInput
                                    value={s.goals}
                                    keyboardType="numeric"
                                    onChangeText={(t) => this.setStat(playerId, 'goals', t)}
                                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text>Assist.</Text>
                                <TextInput
                                    value={s.assists}
                                    keyboardType="numeric"
                                    onChangeText={(t) => this.setStat(playerId, 'assists', t)}
                                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text>Amarelos</Text>
                                <TextInput
                                    value={s.yellow}
                                    keyboardType="numeric"
                                    onChangeText={(t) => this.setStat(playerId, 'yellow', t)}
                                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                            <Text style={{ marginRight: 8 }}>Vermelho</Text>
                            <Switch
                                value={s.red}
                                disabled={this.toIntSafe(s.yellow) === 2}
                                onValueChange={(v) => this.setStat(playerId, 'red', v)}
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    };

    render() {
        const {
            loadingPlayers,
            saving,
            dateObj,
            showDatePicker,
            opponent,
            goalsFor,
            goalsAgainst,
            home,
            players,
        } = this.state;

        if (loadingPlayers) return <ActivityIndicator style={{ marginTop: 20 }} />;

        return (
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
                <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Adicionar Jogo</Text>

                <Text>Data</Text>
                <TouchableOpacity
                    onPress={() => this.setState({ showDatePicker: true })}
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12 }}
                >
                    <Text>{this.formatDate(dateObj)}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={dateObj}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            if (event.type === 'dismissed') return this.setState({ showDatePicker: false });
                            this.setState({ dateObj: selectedDate || dateObj, showDatePicker: false });
                        }}
                    />
                )}

                <Text>Adversário</Text>
                <TextInput
                    value={opponent}
                    onChangeText={(t) => this.setState({ opponent: t })}
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 }}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ marginRight: 10 }}>Jogo em casa?</Text>
                    <Switch value={home} onValueChange={(v) => this.setState({ home: v })} />
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                        <Text>Golos a favor</Text>
                        <TextInput
                            value={goalsFor}
                            keyboardType="numeric"
                            onChangeText={(t) => this.setState({ goalsFor: t })}
                            style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 }}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text>Golos contra</Text>
                        <TextInput
                            value={goalsAgainst}
                            keyboardType="numeric"
                            onChangeText={(t) => this.setState({ goalsAgainst: t })}
                            style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 }}
                        />
                    </View>
                </View>

                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                    Titulares e suplentes usados
                </Text>

                {players.length === 0 ? <Text>Sem jogadores nesta equipa.</Text> : players.map(this.renderPlayerRow)}

                <View style={{ height: 16 }} />

                {saving ? <ActivityIndicator /> : <Button title="Guardar jogo" onPress={this.handleSave} />}
            </ScrollView>
        );
    }
}
export default AddGameScreen;