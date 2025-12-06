import React, { Component } from 'react';
import {View, Text, TextInput, Button, Alert, Image, ActivityIndicator,} from 'react-native';
import {uploadImageToImgbb, createTeamApi,} from '../services/api';
import {launchCamera, launchImageLibrary,} from 'react-native-image-picker';

class AddTeamScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            localUri: null,
            base64Image: null,

            uploading: false,
            saving: false,
        };
    }

    handleChangeName = (text) => {
        this.setState({ name: text });
    };

    pickFromGallery = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                includeBase64: true,
            },
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
            {
                mediaType: 'photo',
                includeBase64: true,
            },
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

    handleSaveTeam = async () => {
        const { name, base64Image } = this.state;
        const { route, navigation } = this.props;
        const user = route.params?.user;

        if (!user) {
            Alert.alert('Erro', 'Utilizador não encontrado.');
            return;
        }

        if (!name || !base64Image) {
            Alert.alert('Erro', 'Preenche o nome e escolhe uma imagem.');
            return;
        }

        try {
            this.setState({ uploading: true });

            // 1) Upload para ImgBB
            const { imageUrl, deleteUrl } = await uploadImageToImgbb(base64Image);

            this.setState({ uploading: false, saving: true });

            const userId = user._id || user.id;

            // 2) Criar equipa na RestDB
            await createTeamApi(userId, name, imageUrl, deleteUrl);

            this.setState({ saving: false });

            Alert.alert('Sucesso', 'Equipa criada com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (err) {
            console.error(err);
            this.setState({ uploading: false, saving: false });
            Alert.alert('Erro', 'Não foi possível criar a equipa.');
        }
    };

    render() {
        const { name, localUri, uploading, saving } = this.state;

        return (
            <View style={{ flex: 1, padding: 16 }}>
                <Text style={{ fontSize: 22, marginBottom: 16 }}>Adicionar Equipa</Text>

                <Text>Nome da equipa</Text>
                <TextInput
                    value={name}
                    onChangeText={this.handleChangeName}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 8,
                        marginBottom: 12,
                    }}
                />

                <Text>Imagem</Text>
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
                    <Button title="Guardar equipa" onPress={this.handleSaveTeam} />
                )}
            </View>
        );
    }
}

export default AddTeamScreen;
