import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PerformanceDashboard = ({ healthData }) => {
    if (!healthData) return null;

    const {
        hrv,
        rhr,
        sleepDuration, // in minutes
        deepSleep, // in minutes
        remSleep, // in minutes
        score,
        indicators = {},
        diagnostics = []
    } = healthData;

    // Helper functions
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const renderMetricLabel = (label, isLow) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Text style={styles.metricLabel}>{label}</Text>
            {isLow && <Text style={styles.lowIndicator}> ❗ LOW</Text>}
        </View>
    );

    // Sleep Composite Bar
    const renderCompositeBar = () => {
        const totalRaw = sleepDuration || 1; // avoid division by 0
        const deepRaw = deepSleep || 0;
        const remRaw = remSleep || 0;
        const lightRaw = Math.max(0, totalRaw - deepRaw - remRaw);

        // Calculate Percentages
        const deepPct = (deepRaw / totalRaw) * 100;
        const remPct = (remRaw / totalRaw) * 100;
        const lightPct = (lightRaw / totalRaw) * 100;

        return (
            <View style={styles.metricContainer}>
                {renderMetricLabel('TOTAL SLEEP', indicators.totalSleep)}
                <Text style={styles.metricValue}>{formatTime(sleepDuration)}</Text>

                {/* Composite Bar */}
                <View style={styles.compositeBarContainer}>
                    {deepPct > 0 && <View style={[styles.barSegment, { width: `${deepPct}%`, backgroundColor: '#0ea5e9' }]} />}
                    {remPct > 0 && <View style={[styles.barSegment, { width: `${remPct}%`, backgroundColor: '#f59e0b' }]} />}
                    {lightPct > 0 && <View style={[styles.barSegment, { width: `${lightPct}%`, backgroundColor: '#64748b' }]} />}
                </View>

                {/* Legend Context */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#0ea5e9' }]} />
                        <Text style={styles.legendText}>Deep {Math.round(deepPct)}%</Text>
                        {indicators.deepSleep && <Text style={styles.lowIndicatorInline}>❗</Text>}
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                        <Text style={styles.legendText}>REM {Math.round(remPct)}%</Text>
                        {indicators.remSleep && <Text style={styles.lowIndicatorInline}>❗</Text>}
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#64748b' }]} />
                        <Text style={styles.legendText}>Light {Math.round(lightPct)}%</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderBar = (label, value, target, isLow, suffix = '') => {
        let pct = (value / target) * 100;
        if (pct > 100) pct = 100;

        let barColor = '#38bdf8'; // Default tactical blue
        if (isLow) barColor = '#ef4444'; // Red if low priority warning

        return (
            <View style={styles.metricContainer}>
                {renderMetricLabel(label, isLow)}
                <Text style={styles.metricValue}>{value}{suffix}</Text>
                <View style={styles.barOverlay}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
            </View>
        )
    };

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

            <View style={styles.metricsPanel}>
                {/* Single Composite Sleep Bar */}
                {renderCompositeBar()}

                {/* Heart Rate & HRV Bars */}
                {renderBar('RESTING HR', rhr, 100, indicators.rhr, ' bpm')}
                {renderBar('HEART RATE VARIABILITY', hrv, 150, indicators.hrv, ' ms')}
            </View>

            {/* Daily Optimization Checklist */}
            <View style={styles.habitTrackerContainer}>
                <Text style={styles.habitTrackerTitle}>DAILY OPTIMIZATION PROTOCOLS</Text>

                <View style={styles.habitItem}>
                    <View style={styles.checkboxEmpty} />
                    <Text style={styles.habitText}>Morning Sun Viewed (10+ min)</Text>
                </View>

                <View style={styles.habitItem}>
                    <View style={styles.checkboxEmpty} />
                    <Text style={styles.habitText}>Caffeine Cutoff Met (2:00 PM)</Text>
                </View>

                <View style={styles.habitItem}>
                    <View style={styles.checkboxEmpty} />
                    <Text style={styles.habitText}>Breathwork Before Bed (5 min)</Text>
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
        color: '#38bdf8',
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
    metricsPanel: {
        width: width * 0.9,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 15,
        gap: 25, // spacing between metrics
    },
    metricContainer: {
        width: '100%',
    },
    metricLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    metricValue: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    lowIndicator: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    lowIndicatorInline: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    barOverlay: {
        width: '100%',
        height: 6,
        backgroundColor: '#0f172a', // very dark background for the bar
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    compositeBarContainer: {
        width: '100%',
        height: 10,
        backgroundColor: '#0f172a',
        borderRadius: 5,
        overflow: 'hidden',
        flexDirection: 'row',
        marginBottom: 8,
    },
    barSegment: {
        height: '100%',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        paddingHorizontal: 2,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '500',
    },
    diagnosticsContainer: {
        width: width * 0.9,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
    },
    habitTrackerContainer: {
        width: width * 0.9,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#38bdf8',
        padding: 16,
        borderRadius: 8,
        marginTop: 5,
        marginBottom: 10,
    },
    habitTrackerTitle: {
        color: '#38bdf8',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 15,
    },
    habitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkboxEmpty: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#64748b',
        marginRight: 12,
        backgroundColor: '#0f172a',
    },
    habitText: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: '500',
    }
});

export default PerformanceDashboard;
