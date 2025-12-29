import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert, Image, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import { uploadImageToImgbb, createTeamApi } from '../services/api';
import { fetchTeamsByUser } from '../context/actions/teamActions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';


class AddTeamScreen extends Component {
    static contextType = AppContext;

    state = { name: '', localUri: null, base64Image: null, loading: false };

    pickGallery = () => {
        launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (res) => {
            if (res.didCancel) return;
            if (res.errorCode) return Alert.alert('Erro', 'Não foi possível abrir a galeria.');
            const asset = res.assets?.[0];
            if (!asset) return;
            this.setState({ localUri: asset.uri, base64Image: asset.base64 });
        });
    };

    pickCamera = () => {
        launchCamera({ mediaType: 'photo', includeBase64: true }, (res) => {
            if (res.didCancel) return;
            if (res.errorCode) return Alert.alert('Erro', 'Não foi possível abrir a câmara.');
            const asset = res.assets?.[0];
            if (!asset) return;
            this.setState({ localUri: asset.uri, base64Image: asset.base64 });
        });
    };

    handleSave = async () => {
        const { state, dispatch } = this.context;
        const user = state.auth.user;
        if (!user) return Alert.alert('Erro', 'Utilizador não autenticado.');

        const userId = user._id || user.id;
        const { name, base64Image } = this.state;

        if (!name) return Alert.alert('Erro', 'Indica o nome da equipa.');
        if (!base64Image) return Alert.alert('Erro', 'Escolhe uma imagem.');

        try {
            this.setState({ loading: true });

            const { imageUrl, deleteUrl } = await uploadImageToImgbb(base64Image);
            await createTeamApi(userId, name.trim(), imageUrl, deleteUrl);

            await fetchTeamsByUser(userId, dispatch);

            this.setState({ loading: false });
            this.props.navigation.goBack();
        } catch (e) {
            console.error(e);
            this.setState({ loading: false });
            Alert.alert('Erro', 'Não foi possível criar a equipa.');
        }
    };

    render() {
        const { name, localUri, loading } = this.state;

        return (
            <View style={{ flex: 1, padding: 16 }}>
                <Text>Nome da equipa</Text>
                <TextInput value={name} onChangeText={(t) => this.setState({ name: t })} style={{ borderWidth: 1, padding: 8, marginBottom: 12 }} />

                <Text>Imagem</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                    <View style={{ marginRight: 8 }}>
                        <Button title="Galeria" onPress={this.pickGallery} />
                    </View>
                    <Button title="Câmara" onPress={this.pickCamera} />
                </View>

                {localUri && <Image source={{ uri: localUri }} style={{ width: 120, height: 120, borderRadius: 10, backgroundColor: '#eee', marginBottom: 16 }} />}

                {loading ? <ActivityIndicator /> : <Button title="Guardar equipa" onPress={this.handleSave} />}
            </View>
        );
    }
}

export default AddTeamScreen;
