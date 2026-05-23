import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { getOrderById, updateOrderStatus } from '../services/api';
import { ServiceOrder, ServiceStatus, formatStatus } from '../types';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../services/ThemeContext';

type RootStackParamList = {
    OrderDetail: { orderId: number };
};

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen = () => {
    const route = useRoute<OrderDetailRouteProp>();
    const navigation = useNavigation();
    const { orderId } = route.params;
    const { colors, isDark } = useTheme();

    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);

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
        try {
            await updateOrderStatus(orderId, newStatus);
            fetchOrder();
            Alert.alert('Éxito', 'Estado actualizado');
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el estado');
        }
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

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Evidencias</Text>
            <View style={styles.evidenceGroup}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.evidenceContent}>
                    {order.evidencias.map((ev) => (
                        <Image 
                            key={ev.id} 
                            source={{ uri: `http://192.168.1.11:8080/uploads/${ev.rutaImagen}` }} 
                            style={[styles.evidenceImage, { backgroundColor: colors.card }]} 
                        />
                    ))}
                    {order.evidencias.length === 0 && (
                        <View style={[styles.emptyEvidence, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.noEvText, { color: colors.textSecondary }]}>Sin evidencias registradas</Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Actualizar Estado</Text>
            <View style={[styles.statusGroup, { backgroundColor: colors.surface }]}>
                {Object.values(ServiceStatus).map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.statusButton,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            order.estadoActual === status && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => handleUpdateStatus(status)}
                    >
                        <Text style={[
                            styles.statusButtonText,
                            { color: colors.textSecondary },
                            order.estadoActual === status && { color: '#FFFFFF' }
                        ]}>
                            {formatStatus(status)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
    evidenceImage: {
        width: 200,
        height: 200,
        borderRadius: 20,
        marginRight: 12,
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
