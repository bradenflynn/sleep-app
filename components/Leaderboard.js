import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

const mockSquad = [
    { id: '1', name: 'Elite_Sleeper', score: 98, streak: 12 },
    { id: '2', name: 'Braden (You)', score: 85, streak: 5 },
    { id: '3', name: 'Optimized_Human', score: 72, streak: 3 },
    { id: '4', name: 'Rest_Master', score: 65, streak: 0 },
];

export const Leaderboard = () => {
    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={styles.rankContainer}>
                <Text style={styles.rankText}>{item.id}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.streakText}>{item.streak} Day Streak</Text>
            </View>
            <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{item.score}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>THE SQUAD</Text>
            <FlatList
                data={mockSquad}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
        marginVertical: 20,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 20,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    rankContainer: {
        width: 30,
    },
    rankText: {
        color: '#888',
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
    },
    nameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    streakText: {
        color: '#FBBC04',
        fontSize: 12,
        marginTop: 2,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    scoreText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
});
