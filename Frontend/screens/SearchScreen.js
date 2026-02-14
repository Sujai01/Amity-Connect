import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function SearchScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.center}>
                <Text style={styles.text}>Search Screen</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { color: '#FFF', fontSize: 20, fontWeight: 'bold' }
});
