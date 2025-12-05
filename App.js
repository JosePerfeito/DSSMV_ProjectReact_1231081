import React, { Component } from 'react';
import { View, Text } from 'react-native';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'DSSMV: React-native example',
        };
    }

    render() {
        const title = this.state.title;
        return (
            <View style={{ marginTop: 50 }}>
                <Text>{title}</Text>
            </View>
        );
    }
}
export default App;
