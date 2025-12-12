import React, { Component } from 'react';
import {View, Text, TextInput, Button, Alert,Image, ActivityIndicator, ScrollView, TouchableOpacity,} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    uploadImageToImgbb,
    createPlayerApi,
    getPlayersByTeam,
} from '../services/api';
import {
    launchCamera,
    launchImageLibrary,
} from 'react-native-image-picker';

const POSITION_OPTIONS = [
    'GR',
    'LD',
    'LE',
    'DC',
    'MCD',
    'MC',
    'MCO',
    'PL',
    'EE',
    'ED',
];

class AddPlayerScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            number: '',
            birthdayDate: new Date(),
            selectedPositions: [],
            localUri: null,
            base64Image: null,
            uploading: false,
            saving: false,
            showDatePicker: false,
        };
    }

    handleChange = (field, value) => {
        this.setState({ [field]: value });
    };

    togglePosition = (pos) => {
        this.setState((prevState) => {
            const exists = prevState.selectedPositions.includes(pos);
            if (exists) {
                return {
                    selectedPositions: prevState.selectedPositions.filter(
                        (p) => p !== pos
                    ),
                };
            } else {
                return {
                    selectedPositions: [...prevState.selectedPositions, pos],
                };
            }
        });
    };

    pickFromGallery = () => {
        launchImageLibrary(
            { mediaType: 'photo', includeBase64: true },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    console.log(response.errorMessage);
                    Alert.alert('Erro', 'Não foi possível abrir a galeria.');
                    return;
                }

                const asset = response.assets?.[0];
                if (!asset) return;

                this.setState({
                    localUri: asset.uri,
                    base64Image: asset.base64,
                });
            }
        );
    };

    pickFromCamera = () => {
        launchCamera(
            { mediaType: 'photo', includeBase64: true },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    console.log(response.errorMessage);
                    Alert.alert('Erro', 'Não foi possível abrir a câmara.');
                    return;
                }

                const asset = response.assets?.[0];
                if (!asset) return;

                this.setState({
                    localUri: asset.uri,
                    base64Image: asset.base64,
                });
            }
        );
    };

    isValidDate = (value) => {
        const re = /^\d{4}-\d{2}-\d{2}$/;
        return re.test(value);
    };

    openDatePicker = () => {
        this.setState({ showDatePicker: true });
    };

    handleDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            this.setState({ showDatePicker: false });
            return;
        }

        this.setState({
            birthdayDate: selectedDate,
            showDatePicker: false,
        });
    };

    formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    handleSave = async () => {
        const {
            name,
            number,
            birthdayDate,
            selectedPositions,
            base64Image,
        } = this.state;

        const { route, navigation } = this.props;
        const team = route.params?.team;

        if (!team) {
            Alert.alert('Erro', 'Equipa não encontrada.');
            return;
        }

        if (!name || !number || !birthdayDate) {
            Alert.alert('Erro', 'Preenche nome, número e data de nascimento.');
            return;
        }

        if (!this.isValidDate(this.formatDate(birthdayDate))) {
            Alert.alert('Erro', 'Data inválida. Usa o formato YYYY-MM-DD.');
            return;
        }

        if (selectedPositions.length === 0) {
            Alert.alert('Erro', 'Seleciona pelo menos uma posição.');
            return;
        }

        if (!base64Image) {
            Alert.alert('Erro', 'Escolhe uma fotografia.');
            return;
        }

        //converter para número (TextInput vem sempre como string)
        const shirtNumber = parseInt(number, 10);
        if (isNaN(shirtNumber)) {
            Alert.alert('Erro', 'Número inválido.');
            return;
        }

        if (shirtNumber < 1 || shirtNumber > 99) {
            Alert.alert('Erro', 'O número do jogador tem de estar entre 1 e 99.');
            return;
        }

        try {
            const teamId = team.id || team._id;

            // Verificar se já existe jogador com esse número na mesma equipa
            const players = await getPlayersByTeam(teamId);

            const numberTaken = players.some(
                (player) => Number(player.number) === shirtNumber
            );

            if (numberTaken) {
                Alert.alert('Erro', 'Já existe um jogador com esse número.');
                return;
            }

            // Se o número não foi encontrado, pode salvar o jogador
            this.setState({ uploading: true });

            // 1) Upload foto para ImgBB
            const { imageUrl, deleteUrl } = await uploadImageToImgbb(base64Image);

            this.setState({ uploading: false, saving: true });

            const posString = selectedPositions.join('/');

            // 2) Criar jogador na RestDB
            await createPlayerApi(
                teamId,
                name,
                this.formatDate(birthdayDate),
                shirtNumber, // ✅ já convertido
                posString,
                imageUrl,
                deleteUrl
            );

            this.setState({ saving: false });

            Alert.alert('Sucesso', 'Jogador adicionado com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (err) {
            console.error(err);
            this.setState({ uploading: false, saving: false });
            Alert.alert('Erro', 'Não foi possível adicionar o jogador.');
        }
    };

    render() {
        const {
            name,
            number,
            birthdayDate,
            selectedPositions,
            localUri,
            uploading,
            saving,
            showDatePicker,
        } = this.state;

        return (
            <ScrollView
                style={{ flex: 1, padding: 16 }}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <Text style={{ fontSize: 22, marginBottom: 16 }}>
                    Adicionar Jogador
                </Text>

                <Text>Nome</Text>
                <TextInput
                    value={name}
                    onChangeText={(t) => this.handleChange('name', t)}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 8,
                        marginBottom: 12,
                    }}
                />

                <Text>Número</Text>
                <TextInput
                    value={number}
                    onChangeText={(t) => this.handleChange('number', t)}
                    keyboardType="numeric"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 8,
                        marginBottom: 12,
                    }}
                />

                <Text>Data de nascimento</Text>
                <TouchableOpacity
                    onPress={this.openDatePicker}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <Text>{this.formatDate(birthdayDate)}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={birthdayDate}
                        mode="date"
                        display="default"
                        onChange={this.handleDateChange}
                        maximumDate={new Date()} // Limita para a data atual
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
                                <Text
                                    style={{
                                        color: selected ? '#007AFF' : '#000',
                                    }}
                                >
                                    {pos}
                                </Text>
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

                {localUri && (
                    <Image
                        source={{ uri: localUri }}
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 8,
                            marginBottom: 16,
                            backgroundColor: '#eee',
                        }}
                    />
                )}

                {(uploading || saving) ? (
                    <ActivityIndicator />
                ) : (
                    <Button title="Guardar jogador" onPress={this.handleSave} />
                )}
            </ScrollView>
        );
    }
}

export default AddPlayerScreen;
