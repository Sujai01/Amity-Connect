import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Placeholder for MapView since react-native-maps might not be installed yet
// If user wants real map, we will install it later.
const MapPlaceholder = () => (
    <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map View</Text>
        <Text style={styles.subText}>Find your community nearby</Text>
    </View>
);

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.content}>
                <MapPlaceholder />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    content: {
        flex: 1,
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    mapText: {
        color: '#3B82F6',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subText: {
        color: '#94A3B8',
        marginTop: 8,
    }
});
