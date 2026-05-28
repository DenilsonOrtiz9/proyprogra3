import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getOrderById, updateOrderStatus, uploadEvidence } from '../services/api';
import { ServiceOrder, ServiceStatus, formatStatus } from '../types';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../services/ThemeContext';
import ImageModal from '../components/ImageModal';

type RootStackParamList = {
    OrderDetail: { orderId: number };
};

const STATUS_ORDER = [
    ServiceStatus.RECIBIDO,
    ServiceStatus.EN_DIAGNOSTICO,
    ServiceStatus.EN_REPARACION,
    ServiceStatus.LISTO_ENTREGA,
    ServiceStatus.ENTREGADO
];

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen = () => {
    const route = useRoute<OrderDetailRouteProp>();
    const navigation = useNavigation();
    const { orderId } = route.params;
    const { colors, isDark } = useTheme();

    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // State for Image Modal
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchOrder = async () => {
        try {
            const data = await getOrderById(orderId);
            setOrder(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo cargar la orden');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const handleUpdateStatus = async (newStatus: ServiceStatus) => {
        const currentIndex = STATUS_ORDER.indexOf(order!.estadoActual);
        const newIndex = STATUS_ORDER.indexOf(newStatus);

        if (newIndex <= currentIndex) {
            Alert.alert('Acción no permitida', 'No se puede regresar a un estado anterior o igual al actual.');
            return;
        }

        // Solicitar foto
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para documentar el cambio de estado');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.6,
            allowsEditing: false,
        });

        if (result.canceled) return;

        setUpdating(true);
        try {
            await updateOrderStatus(orderId, newStatus, result.assets[0].uri);
            await fetchOrder();
            Alert.alert('Éxito', 'Estado actualizado con evidencia fotográfica');
        } catch (error: any) {
            const errorMsg = error.response?.data || 'No se pudo actualizar el estado';
            Alert.alert('Error', errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddEvidence = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.6,
            allowsEditing: false,
        });

        if (result.canceled) return;

        setUpdating(true);
        try {
            await uploadEvidence(orderId, result.assets[0].uri);
            await fetchOrder();
            Alert.alert('Éxito', 'Evidencia agregada correctamente');
        } catch (error: any) {
            Alert.alert('Error', 'No se pudo subir la evidencia');
        } finally {
            setUpdating(false);
        }
    };

    const isStatusDisabled = (status: ServiceStatus) => {
        if (!order) return true;
        const currentIndex = STATUS_ORDER.indexOf(order.estadoActual);
        const buttonIndex = STATUS_ORDER.indexOf(status);
        return buttonIndex <= currentIndex;
    };

    const openImage = (uri: string) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!order) return null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={[styles.orderIdLabel, { color: colors.textSecondary }]}>Detalle de Orden</Text>
                <Text style={[styles.orderNumber, { color: colors.text }]}>#00{order.id}</Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date(order.fechaCreacion).toLocaleDateString()}</Text>
            </View>

            <View style={[styles.infoGroup, { backgroundColor: colors.surface }]}>
                <View style={styles.infoRow}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Cliente</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{order.clienteNombre}</Text>
                </View>
                <View style={[styles.separator, { backgroundColor: colors.background }]} />
                <View style={styles.infoRow}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Dispositivo</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{order.dispositivo}</Text>
                </View>
                <View style={[styles.separator, { backgroundColor: colors.background }]} />
                <View style={styles.infoRow}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Problema</Text>
                    <Text style={[styles.description, { color: colors.text }]}>{order.descripcionProblema}</Text>
                </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Evidencias por estado</Text>
            <View style={styles.evidenceGroup}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.evidenceContent}>
                    {order.evidencias.map((ev) => (
                        <TouchableOpacity 
                            key={ev.id} 
                            style={styles.evidenceItem}
                            onPress={() => openImage(`http://192.168.1.6:8080/uploads/${ev.rutaImagen}`)}
                        >
                            <Image 
                                source={{ uri: `http://192.168.1.6:8080/uploads/${ev.rutaImagen}` }} 
                                style={[styles.evidenceImage, { backgroundColor: colors.card }]} 
                            />
                            {ev.estado && (
                                <View style={[styles.statusTag, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.statusTagText}>{formatStatus(ev.estado)}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                    {order.evidencias.length === 0 && (
                        <View style={styles.emptyEvidenceContainer}>
                            <View style={[styles.emptyEvidence, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.noEvText, { color: colors.textSecondary }]}>Sin evidencias registradas</Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.addEvidenceButton, { backgroundColor: colors.primary }]}
                                onPress={handleAddEvidence}
                            >
                                <Text style={styles.addEvidenceIcon}>📷</Text>
                                <Text style={styles.addEvidenceText}>Agregar Evidencia</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Actualizar Estado</Text>
            <View style={[styles.statusGroup, { backgroundColor: colors.surface }]}>
                {updating ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ padding: 20, width: '100%' }} />
                ) : (
                    STATUS_ORDER.map((status) => {
                        const disabled = isStatusDisabled(status);
                        const isCurrent = order.estadoActual === status;
                        
                        return (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusButton,
                                    { backgroundColor: colors.card, borderColor: colors.border },
                                    isCurrent && { backgroundColor: colors.primary, borderColor: colors.primary },
                                    disabled && !isCurrent && { opacity: 0.3 }
                                ]}
                                onPress={() => handleUpdateStatus(status)}
                                disabled={disabled || updating}
                            >
                                <Text style={[
                                    styles.statusButtonText,
                                    { color: colors.textSecondary },
                                    isCurrent && { color: '#FFFFFF' },
                                    disabled && !isCurrent && { color: colors.textSecondary }
                                ]}>
                                    {formatStatus(status)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>

            <ImageModal 
                visible={modalVisible}
                imageUrl={selectedImage}
                onClose={() => setModalVisible(false)}
            />
        </ScrollView>
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
        paddingTop: 20,
        paddingBottom: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    orderIdLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    orderNumber: {
        fontSize: 32,
        fontWeight: '700',
        marginVertical: 4,
    },
    date: {
        fontSize: 14,
    },
    infoGroup: {
        marginHorizontal: 24,
        borderRadius: 24,
        paddingVertical: 8,
        marginBottom: 24,
    },
    infoRow: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    label: {
        fontSize: 13,
        marginBottom: 4,
        fontWeight: '600',
    },
    value: {
        fontSize: 17,
        fontWeight: '500',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
    },
    separator: {
        height: 1,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginHorizontal: 32,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    evidenceGroup: {
        marginBottom: 24,
    },
    evidenceContent: {
        paddingHorizontal: 24,
    },
    evidenceItem: {
        marginRight: 12,
        position: 'relative',
    },
    evidenceImage: {
        width: 200,
        height: 250,
        borderRadius: 20,
    },
    statusTag: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: 'center',
    },
    statusTagText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    emptyEvidence: {
        width: '100%',
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noEvText: {
        fontStyle: 'italic',
    },
    emptyEvidenceContainer: {
        alignItems: 'center',
        width: 300,
        marginRight: 24,
    },
    addEvidenceButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    addEvidenceIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    addEvidenceText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    statusGroup: {
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OrderDetailScreen;
