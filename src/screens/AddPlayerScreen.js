import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { uploadImageToImgbb, createPlayerApi, existsPlayerNumber } from '../services/api';
import { AppContext } from '../context/AppContext';
import { fetchPlayersByTeam } from '../context/actions/playerActions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const POSITION_OPTIONS = ['GR', 'LD', 'LE', 'DC', 'MCD', 'MC', 'MCO', 'PL', 'EE', 'ED'];

class AddPlayerScreen extends Component {
    static contextType = AppContext;

    state = {
        name: '',
        number: '',
        birthdayDate: new Date(2000, 0, 1),
        showDatePicker: false,
        selectedPositions: [],
        localUri: null,
        base64Image: null,
        uploading: false,
        saving: false,
    };

    togglePosition = (pos) => {
        this.setState((prev) => {
            const selected = prev.selectedPositions.includes(pos);
            return { selectedPositions: selected ? prev.selectedPositions.filter((p) => p !== pos) : [...prev.selectedPositions, pos] };
        });
    };

    openDatePicker = () => this.setState({ showDatePicker: true });

    handleDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') return this.setState({ showDatePicker: false });
        this.setState({ birthdayDate: selectedDate, showDatePicker: false });
    };

    formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    pickFromGallery = () => {
        launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (res) => {
            if (res.didCancel) return;
            if (res.errorCode) return Alert.alert('Erro', 'Não foi possível abrir a galeria.');
            const asset = res.assets?.[0];
            if (!asset) return;
            this.setState({ localUri: asset.uri, base64Image: asset.base64 });
        });
    };

    pickFromCamera = () => {
        launchCamera({ mediaType: 'photo', includeBase64: true }, (res) => {
            if (res.didCancel) return;
            if (res.errorCode) return Alert.alert('Erro', 'Não foi possível abrir a câmara.');
            const asset = res.assets?.[0];
            if (!asset) return;
            this.setState({ localUri: asset.uri, base64Image: asset.base64 });
        });
    };
    isFutureDate = (dateObj) => {
        const d = new Date(dateObj);
        d.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return d > today;
    };

    handleSave = async () => {
        const { dispatch } = this.context;
        const team = this.props.route.params?.team;
        if (!team) return Alert.alert('Erro', 'Equipa não encontrada.');

        const teamId = team._id || team.id;

        const { name, number, birthdayDate, selectedPositions, base64Image } = this.state;

        if (!name || !number) return Alert.alert('Erro', 'Preenche nome e número.');
        if (selectedPositions.length === 0) return Alert.alert('Erro', 'Seleciona pelo menos uma posição.');
        if (!base64Image) return Alert.alert('Erro', 'Escolhe uma fotografia.');

        //  número 1..99
        const shirtNumber = parseInt(number, 10);
        if (isNaN(shirtNumber)) return Alert.alert('Erro', 'O número do jogador tem de ser numérico.');
        if (shirtNumber < 1 || shirtNumber > 99) return Alert.alert('Erro', 'O número do jogador tem de estar entre 1 e 99.');

        try {
            //  evitar data futura
            if (this.isFutureDate(birthdayDate)) {
                Alert.alert('Erro', 'A data de nascimento não pode ser futura.');
                return;
            }

            //  impedir nº repetido
            const exists = await existsPlayerNumber(teamId, shirtNumber);
            if (exists) return Alert.alert('Erro', 'Já existe um jogador com esse número.');

            this.setState({ uploading: true });

            const { imageUrl, deleteUrl } = await uploadImageToImgbb(base64Image);

            this.setState({ uploading: false, saving: true });

            const posString = selectedPositions.join('/');

            await createPlayerApi(
                teamId,
                name.trim(),
                this.formatDate(birthdayDate),
                shirtNumber,
                posString,
                imageUrl,
                deleteUrl
            );

            await fetchPlayersByTeam(teamId, dispatch);

            this.setState({ saving: false });
            this.props.navigation.goBack();
        } catch (e) {
            console.error(e);
            this.setState({ uploading: false, saving: false });
            Alert.alert('Erro', 'Não foi possível adicionar o jogador.');
        }
    };

    render() {
        const { name, number, birthdayDate, showDatePicker, selectedPositions, localUri, uploading, saving } = this.state;

        return (
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
                <Text style={{ fontSize: 22, marginBottom: 16 }}>Adicionar Jogador</Text>

                <Text>Nome</Text>
                <TextInput value={name} onChangeText={(t) => this.setState({ name: t })} style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12 }} />

                <Text>Número (1-99)</Text>
                <TextInput value={number} onChangeText={(t) => this.setState({ number: t })} keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12 }} />

                <Text>Data de nascimento</Text>
                <TouchableOpacity onPress={this.openDatePicker} style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12 }}>
                    <Text>{this.formatDate(birthdayDate)}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={birthdayDate}
                        mode="date"
                        display="default"
                        onChange={this.handleDateChange}
                        maximumDate={new Date()} // ✅ impede futuro
                    />
                )}

                <Text>Posições</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                    {POSITION_OPTIONS.map((pos) => {
                        const selected = selectedPositions.includes(pos);
                        return (
                            <TouchableOpacity
                                key={pos}
                                onPress={() => this.togglePosition(pos)}
                                style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: selected ? '#007AFF' : '#ccc',
                                    backgroundColor: selected ? '#007AFF22' : '#fff',
                                    marginRight: 8,
                                    marginBottom: 8,
                                }}
                            >
                                <Text style={{ color: selected ? '#007AFF' : '#000' }}>{pos}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text>Fotografia</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                    <View style={{ marginRight: 8 }}>
                        <Button title="Galeria" onPress={this.pickFromGallery} />
                    </View>
                    <Button title="Câmara" onPress={this.pickFromCamera} />
                </View>

                {localUri && <Image source={{ uri: localUri }} style={{ width: 120, height: 120, borderRadius: 10, marginBottom: 16, backgroundColor: '#eee' }} />}

                {(uploading || saving) ? <ActivityIndicator /> : <Button title="Guardar jogador" onPress={this.handleSave} />}
            </ScrollView>
        );
    }
}

export default AddPlayerScreen;