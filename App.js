import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import HealthKitService from './services/HealthKitService';
import ChatService from './services/ChatService';
import PerformanceDashboard from './components/PerformanceDashboard';

export default function App() {
    const [healthData, setHealthData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            const data = await HealthKitService.getPerformanceData();
            setHealthData(data);

            // Initial System Message
            setMessages([
                {
                    role: 'assistant',
                    content: 'Performance logs loaded. What protocol would you like to review?'
                }
            ]);
        }
        loadData();
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        const response = await ChatService.sendMessage(userMsg.content, healthData);

        setMessages(prev => [...prev, response]);
        setIsLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <PerformanceDashboard healthData={healthData} />

                    <View style={styles.chatSection}>
                        <View style={styles.chatHeader}>
                            <Text style={styles.chatTitle}>AI MISSION BRIEFING</Text>
                        </View>

                        {messages.map((msg, index) => (
                            <View key={index} style={[
                                styles.messageBubble,
                                msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                            ]}>
                                <Text style={styles.messageText}>{msg.content}</Text>
                            </View>
                        ))}
                        {isLoading && (
                            <View style={[styles.messageBubble, styles.assistantBubble]}>
                                <Text style={styles.messageText}>Processing parameters...</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Query protocols (e.g., 'magnesium' or 'light')"
                        placeholderTextColor="#64748b"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Text style={styles.sendButtonText}>SEND</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617', // Very dark blue/black background
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    chatSection: {
        width: '100%',
        marginTop: 10,
        backgroundColor: '#0f172a',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    chatHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        paddingBottom: 10,
        marginBottom: 15,
    },
    chatTitle: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        maxWidth: '85%',
    },
    userBubble: {
        backgroundColor: '#0ea5e9', // Tactical Acccents
        alignSelf: 'flex-end',
        borderBottomRightRadius: 2,
    },
    assistantBubble: {
        backgroundColor: '#1e293b', // Dark gray/blue panel
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: '#334155',
    },
    messageText: {
        color: '#f8fafc',
        fontSize: 15,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#0f172a',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
    },
    input: {
        flex: 1,
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    sendButton: {
        backgroundColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    sendButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: 1,
        fontSize: 12,
    },
});
