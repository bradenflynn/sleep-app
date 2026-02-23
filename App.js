import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Image, LayoutAnimation, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import HealthKitService from './services/HealthKitService';
import ChatService from './services/ChatService';
import PerformanceDashboard from './components/PerformanceDashboard';
import XMLParserService from './services/XMLParserService';

export default function App() {
    const [healthData, setHealthData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('DASHBOARD');

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

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const synthesizedData = await XMLParserService.processFile(file);
            if (synthesizedData) {
                HealthKitService.setImportedData(synthesizedData);
                setHealthData(synthesizedData);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Health data successfully parsed. Tactical Diagnostics updated based on physiological targets.'
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Failed to extract performance metrics from the provided file.'
                }]);
            }
        } catch (e) {
            console.error(e);
        }
        setIsLoading(false);
    };

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

    const handleTabChange = (tabName) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveTab(tabName);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'DASHBOARD' && styles.activeTab]}
                        onPress={() => handleTabChange('DASHBOARD')}
                    >
                        <Text style={[styles.tabText, activeTab === 'DASHBOARD' && styles.activeTabText]}>DASHBOARD</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'PROTOCOLS' && styles.activeTab]}
                        onPress={() => handleTabChange('PROTOCOLS')}
                    >
                        <Text style={[styles.tabText, activeTab === 'PROTOCOLS' && styles.activeTabText]}>PROTOCOLS</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {activeTab === 'DASHBOARD' && (
                        <>
                            <PerformanceDashboard healthData={healthData} />

                            <View style={styles.importSection}>
                                <TouchableOpacity
                                    style={styles.importButton}
                                    onPress={() => document.getElementById('health-upload').click()}
                                >
                                    <Text style={styles.importButtonText}>TACTICAL DATA INTAKE (EXPORT.XML / ZIP)</Text>
                                </TouchableOpacity>
                                <input
                                    id="health-upload"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                    accept=".xml,.zip"
                                />
                            </View>
                        </>
                    )}

                    {activeTab === 'PROTOCOLS' && (
                        <View style={styles.chatSection}>
                            <View style={styles.chatHeader}>
                                <Text style={styles.chatTitle}>AI MISSION BRIEFING</Text>
                            </View>

                            {messages.map((msg, index) => (
                                <View key={index} style={[
                                    styles.messageWrapper,
                                    msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper
                                ]}>
                                    {msg.role === 'assistant' && (
                                        <Image source={require('./assets/huberman_bw.png')} style={styles.avatar} />
                                    )}
                                    <View style={[
                                        styles.messageBubble,
                                        msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                                    ]}>
                                        <Text style={styles.messageText}>{msg.content}</Text>
                                    </View>
                                </View>
                            ))}
                            {isLoading && (
                                <View style={[styles.messageWrapper, styles.assistantWrapper]}>
                                    <Image source={require('./assets/huberman_bw.png')} style={styles.avatar} />
                                    <View style={[styles.messageBubble, styles.assistantBubble]}>
                                        <Text style={styles.messageText}>Processing parameters...</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                {activeTab === 'PROTOCOLS' && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask about improving your sleep..."
                            placeholderTextColor="#64748b"
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={sendMessage}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                            <Text style={styles.sendButtonText}>SEND</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617', // Very dark blue/black background
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        backgroundColor: '#0f172a',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#38bdf8',
    },
    tabText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    activeTabText: {
        color: '#38bdf8',
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
    messageWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
        width: '100%',
    },
    userWrapper: {
        justifyContent: 'flex-end',
    },
    assistantWrapper: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: '#ffffff',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 8,
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
    importSection: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    importButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#38bdf8',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
        width: '90%',
        alignItems: 'center',
    },
    importButtonText: {
        color: '#38bdf8',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
    },
});
