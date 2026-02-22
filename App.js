import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HealthKitService } from './services/HealthKitService';
import { ChatService } from './services/ChatService';
import { Leaderboard } from './components/Leaderboard';

export default function App() {
    const [readinessScore, setReadinessScore] = useState(0);
    const [chatResponse, setChatResponse] = useState('');

    useEffect(() => {
        async function init() {
            const hasPermission = await HealthKitService.requestPermissions();
            if (hasPermission) {
                const data = await HealthKitService.getSleepData();
                const score = HealthKitService.calculateReadinessScore(data);
                setReadinessScore(score);
            }
        }
        init();
    }, []);

    const handleTestChat = async () => {
        const response = await ChatService.generateResponse('tell me about magnesium and blue light');
        setChatResponse(response);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>NIGHT-OPS</Text>

                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Readiness Score</Text>
                    <Text style={styles.scoreValue}>{readinessScore}</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleTestChat}>
                    <Text style={styles.buttonText}>Test AI Retrieval</Text>
                </TouchableOpacity>

                {chatResponse ? (
                    <View style={styles.chatBox}>
                        <Text style={styles.chatText}>{chatResponse}</Text>
                    </View>
                ) : null}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Educational Purposes Only</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    header: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 4,
        marginVertical: 40,
    },
    scoreCard: {
        width: '100%',
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 30,
    },
    scoreLabel: {
        color: '#888',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    scoreValue: {
        color: '#fff',
        fontSize: 72,
        fontWeight: '200',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginBottom: 30,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    chatBox: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#444',
    },
    chatText: {
        color: '#ccc',
        lineHeight: 22,
        fontSize: 14,
    },
    footer: {
        marginTop: 50,
    },
    footerText: {
        color: '#444',
        fontSize: 10,
        textTransform: 'uppercase',
    }
});
