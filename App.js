import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import AddTeamScreen from './src/screens/AddTeamScreen';


enableScreens();

const Stack = createNativeStackNavigator();

class App extends Component {
    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ title: 'Login' }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ title: 'Criar conta' }}
                    />
                    <Stack.Screen
                        name="Teams"
                        component={TeamsScreen}
                        options={{ title: 'As minhas equipas' }}
                    />
                    <Stack.Screen
                        name="AddTeam"
                        component={AddTeamScreen}
                        options={{ title: 'Nova equipa' }}
                    />

                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}
export default App;
