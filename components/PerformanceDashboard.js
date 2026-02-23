import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PerformanceDashboard = ({ healthData }) => {
    if (!healthData) return null;

    const { indicators = {}, diagnostics = [] } = healthData;

    const renderMetricLabel = (label, isLow) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.metricLabel}>{label}</Text>
            {isLow && <Text style={styles.lowIndicator}> ❗ LOW</Text>}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>NIGHT-OPS</Text>

            {/* Main Score Display */}
            <View style={styles.scoreRing}>
                <View style={styles.scoreInner}>
                    <Text style={styles.scoreText}>{healthData.score}</Text>
                    <Text style={styles.scoreLabel}>READINESS</Text>
                </View>
            </View>

            {/* Metrics Row 1 */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                    {renderMetricLabel("HRV", indicators.hrv)}
                    <Text style={styles.metricValue}>{healthData.hrv} <Text style={styles.metricUnit}>ms</Text></Text>
                </View>
                <View style={styles.metricCard}>
                    {renderMetricLabel("RHR", indicators.rhr)}
                    <Text style={styles.metricValue}>{healthData.rhr} <Text style={styles.metricUnit}>bpm</Text></Text>
                </View>
            </View>

            {/* Metrics Row 2 */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                    {renderMetricLabel("TOTAL SLEEP", indicators.totalSleep)}
                    <Text style={styles.metricValue}>
                        {Math.floor(healthData.sleepDuration / 60)}h {healthData.sleepDuration % 60}m
                    </Text>
                </View>
                <View style={styles.metricCard}>
                    {renderMetricLabel("DEEP SLEEP", indicators.deepSleep)}
                    <Text style={styles.metricValue}>
                        {Math.floor(healthData.deepSleep / 60)}h {healthData.deepSleep % 60}m
                    </Text>
                </View>
            </View>

            {/* Diagnostics Section */}
            {diagnostics.length > 0 && (
                <View style={styles.diagnosticsContainer}>
                    <Text style={styles.diagnosticsTitle}>TACTICAL DIAGNOSTICS</Text>
                    {diagnostics.map((desc, idx) => (
                        <View key={idx} style={styles.diagnosticItem}>
                            <Text style={styles.diagnosticText}>• {desc}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    headerTitle: {
        color: '#38bdf8', // Tactical Blue Accent
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 4,
        marginBottom: 20,
    },
    scoreRing: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 4,
        borderColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(14, 165, 233, 0.05)',
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        marginBottom: 30,
    },
    scoreInner: {
        alignItems: 'center',
    },
    scoreText: {
        color: '#ffffff',
        fontSize: 72,
        fontWeight: 'bold',
    },
    scoreLabel: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 2,
        marginTop: -5,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: width * 0.9,
        marginBottom: 15,
    },
    metricCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        borderWidth: 1,
        borderColor: '#334155',
    },
    metricLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    metricValue: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    metricUnit: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: 'normal',
    },
    lowIndicator: {
        color: '#ef4444', // Red alert color
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
    },
    diagnosticsContainer: {
        width: width * 0.9,
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Faint red warning box
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
        padding: 16,
        borderRadius: 8,
        marginTop: 10,
    },
    diagnosticsTitle: {
        color: '#ef4444',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 10,
    },
    diagnosticItem: {
        marginBottom: 6,
    },
    diagnosticText: {
        color: '#cbd5e1',
        fontSize: 13,
        lineHeight: 18,
    }
});

export default PerformanceDashboard;
