import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/context/AppContext';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import AddTeamScreen from './src/screens/AddTeamScreen';
import AddPlayerScreen from './src/screens/AddPlayerScreen';
import TeamGamesScreen from './src/screens/TeamGamesScreen';
import AddGameScreen from './src/screens/AddGameScreen';


const Stack = createNativeStackNavigator();

export default class App extends Component {
    render() {
        return (
            <AppProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Login">
                        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'FootballManagement' }}/>
                        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
                        <Stack.Screen name="Teams" component={TeamsScreen} options={{ title: 'Equipas' }} />
                        <Stack.Screen name="AddTeam" component={AddTeamScreen} options={{ title: 'Adicionar equipa' }} />
                        <Stack.Screen name="Players" component={PlayersScreen} options={{ title: 'Equipa' }} />
                        <Stack.Screen name="AddPlayer" component={AddPlayerScreen} options={{ title: 'Adicionar jogador' }} />
                        <Stack.Screen name="TeamGames" component={TeamGamesScreen} options={{ title: 'Resultados' }} />
                        <Stack.Screen name="AddGame" component={AddGameScreen} options={{ title: 'Adicionar jogo' }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </AppProvider>
        );
    }
}
