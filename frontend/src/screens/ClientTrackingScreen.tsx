import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { getOrderById } from '../services/api';
import { ServiceOrder, formatStatus } from '../types';
import { useTheme } from '../services/ThemeContext';
import ImageModal from '../components/ImageModal';

const ClientTrackingScreen = () => {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedStatusStep, setSelectedStatusStep] = useState<number | null>(null);
    const { colors, isDark } = useTheme();

    // State for Image Modal
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const STATUS_KEYS = ['RECIBIDO', 'EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO_ENTREGA', 'ENTREGADO'];

    const handleSearch = async () => {
        if (!orderId) {
            Alert.alert('Error', 'Ingrese un número de orden');
            return;
        }

        setLoading(true);
        setOrder(null);
        setSelectedStatusStep(null);
        try {
            const data = await getOrderById(parseInt(orderId));
            setOrder(data);
            // Por defecto mostrar el estado actual al buscar
            setSelectedStatusStep(getStatusStep(data.estadoActual));
        } catch (error) {
            Alert.alert('No encontrado', 'No se encontró una orden con ese ID');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status: string) => {
        return STATUS_KEYS.indexOf(status);
    };

    const filteredEvidencias = order?.evidencias.filter(ev => {
        // Tratar null o undefined como 'RECIBIDO' para compatibilidad con órdenes viejas
        const evEstado = ev.estado || 'RECIBIDO';
        if (selectedStatusStep === null) return true; 
        return evEstado === STATUS_KEYS[selectedStatusStep];
    }) || [];

    const openImage = (uri: string) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Seguimiento</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Consulte el estado de su equipo</Text>
            </View>

            <View style={[styles.content, { backgroundColor: colors.surface }]}>
                <View style={styles.searchContainer}>
                    <View style={[styles.searchPill, { backgroundColor: colors.background }]}>
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Número de orden (ej. 1)"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={orderId}
                            onChangeText={setOrderId}
                        />
                        <TouchableOpacity 
                            style={[styles.searchButton, { backgroundColor: colors.primary }]}
                            onPress={handleSearch}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.searchButtonText}>Buscar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {order && (
                    <View style={styles.resultContainer}>
                        <View style={[styles.statusGroup, { backgroundColor: colors.card }]}>
                            <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>Estado del Servicio</Text>
                            <Text style={[styles.statusValue, { color: colors.primary }]}>{formatStatus(order.estadoActual)}</Text>
                            
                            <View style={[styles.timelineContainer, { borderTopColor: colors.border }]}>
                                {['Recibido', 'Diagnóstico', 'Reparación', 'Listo', 'Entregado'].map((step, index) => {
                                    const isReached = index <= getStatusStep(order.estadoActual);
                                    const isSelected = index === selectedStatusStep;
                                    
                                    return (
                                        <TouchableOpacity 
                                            key={step} 
                                            style={styles.timelineItem}
                                            onPress={() => isReached && setSelectedStatusStep(isSelected ? null : index)}
                                            disabled={!isReached}
                                        >
                                            <View style={[
                                                styles.dot, 
                                                isReached && { backgroundColor: colors.primary }, 
                                                !isReached && { backgroundColor: colors.border },
                                                isSelected && { transform: [{ scale: 1.5 }], borderWidth: 2, borderColor: '#FFFFFF' }
                                            ]} />
                                            <Text style={[
                                                styles.stepText, 
                                                { color: isReached ? colors.text : colors.textSecondary },
                                                isSelected && { fontWeight: '800', color: colors.primary }
                                            ]}>
                                                {step}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <TouchableOpacity onPress={() => setSelectedStatusStep(null)} style={{ marginTop: 12 }}>
                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                                    {selectedStatusStep !== null ? 'Ver todas las evidencias' : ''}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.infoGroup, { backgroundColor: colors.card }]}>
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Dispositivo</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{order.dispositivo}</Text>
                            </View>
                        </View>

                        <View style={styles.evidenceSection}>
                            <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
                                {selectedStatusStep !== null 
                                    ? `Evidencias: ${formatStatus(STATUS_KEYS[selectedStatusStep])}` 
                                    : 'Evidencias del Proceso'}
                            </Text>
                            {filteredEvidencias.length > 0 ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.evidenceContent}>
                                    {filteredEvidencias.map((ev) => (
                                        <TouchableOpacity 
                                            key={ev.id} 
                                            style={styles.evidenceItem}
                                            onPress={() => openImage(`http://192.168.1.6:8080/uploads/${ev.rutaImagen}`)}
                                        >
                                            <Image 
                                                source={{ uri: `http://192.168.1.6:8080/uploads/${ev.rutaImagen}` }}
                                                style={[styles.evidenceThumb, { backgroundColor: colors.background }]}
                                            />
                                            {selectedStatusStep === null && (
                                                <View style={[styles.statusTag, { backgroundColor: colors.primary }]}>
                                                    <Text style={styles.statusTagText}>{formatStatus(ev.estado || 'RECIBIDO')}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View style={[styles.noEvidenceStep, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.noEvidenceText, { color: colors.textSecondary }]}>
                                        No hay fotos registradas para este estado.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </View>

            <ImageModal 
                visible={modalVisible}
                imageUrl={selectedImage}
                onClose={() => setModalVisible(false)}
            />
        </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        height: '25%',
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    content: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 32,
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    searchPill: {
        flexDirection: 'row',
        borderRadius: 28,
        height: 56,
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    searchButton: {
        height: 44,
        paddingHorizontal: 24,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    resultContainer: {
        paddingHorizontal: 24,
    },
    statusGroup: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
    },
    groupTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    statusValue: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 24,
    },
    timelineContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingTop: 16,
        borderTopWidth: 1,
    },
    timelineItem: {
        alignItems: 'center',
        flex: 1,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 6,
    },
    stepText: {
        fontSize: 9,
        textAlign: 'center',
        fontWeight: '600',
    },
    infoGroup: {
        borderRadius: 24,
        paddingVertical: 8,
        marginBottom: 20,
    },
    infoRow: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        marginHorizontal: 20,
    },
    evidenceSection: {
        marginTop: 12,
    },
    evidenceContent: {
        paddingVertical: 12,
    },
    evidenceThumb: {
        width: 140,
        height: 140,
        borderRadius: 20,
    },
    evidenceItem: {
        marginRight: 12,
        position: 'relative',
    },
    noEvidenceStep: {
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    noEvidenceText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    statusTag: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusTagText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: '700',
    },
});

export default ClientTrackingScreen;
