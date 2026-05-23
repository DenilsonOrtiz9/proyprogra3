import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, ScrollView } from 'react-native';
import { getOrders } from '../services/api';
import { ServiceOrder, ServiceStatus, formatStatus } from '../types';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';

type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    OrderList: undefined;
    OrderDetail: { orderId: number };
    CreateOrder: undefined;
    UserManagement: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderList'>;

const OrderListScreen = () => {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    const navigation = useNavigation<NavigationProp>();
    const isFocused = useIsFocused();
    const { userRole, logout } = useAuth();
    const { colors, isDark } = useTheme();

    const isAdmin = userRole?.trim().toUpperCase() === 'ADMIN';

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', gap: 10, marginRight: 10 }}>
                    <TouchableOpacity 
                        onPress={() => {
                            logout();
                            navigation.replace('Home');
                        }}
                        style={{ backgroundColor: '#e74c3c', padding: 8, borderRadius: 5 }}
                    >
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Salir</Text>
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, logout]);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);
            applyFilters(data, searchQuery, selectedStatus);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchOrders();
        }
    }, [isFocused]);

    useEffect(() => {
        applyFilters(orders, searchQuery, selectedStatus);
    }, [searchQuery, selectedStatus, orders]);

    const applyFilters = (data: ServiceOrder[], query: string, status: string | null) => {
        let filtered = [...data];

        if (query) {
            const lowQuery = query.toLowerCase().replace('#', '');
            filtered = filtered.filter(o => {
                const nameMatch = o.clienteNombre.toLowerCase().includes(lowQuery);
                const idMatch = o.id.toString().includes(lowQuery);
                const paddedIdMatch = `#00${o.id}`.toLowerCase().includes(lowQuery);
                const justNumberPadded = `00${o.id}`.includes(lowQuery);
                
                return nameMatch || idMatch || paddedIdMatch || justNumberPadded;
            });
        }

        if (status) {
            filtered = filtered.filter(o => o.estadoActual === status);
        }

        setFilteredOrders(filtered);
    };

    const statusOptions = Object.values(ServiceStatus);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const renderItem = ({ item }: { item: ServiceOrder }) => (
        <TouchableOpacity 
            style={styles.orderItem}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        >
            <View style={[styles.orderIconContainer, { backgroundColor: colors.background }]}>
                <Text style={styles.orderIconText}>📦</Text>
            </View>
            <View style={styles.orderInfo}>
                <View style={styles.orderMainRow}>
                    <Text style={[styles.clientName, { color: colors.text }]}>{item.clienteNombre}</Text>
                    <Text style={[styles.orderId, { color: colors.textSecondary }]}>#00{item.id}</Text>
                </View>
                <View style={styles.orderSubRow}>
                    <Text style={[styles.deviceInfo, { color: colors.textSecondary }]}>{item.dispositivo}</Text>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.estadoActual) }]} />
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>{formatStatus(item.estadoActual)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RECIBIDO': return '#007AFF';
            case 'EN_DIAGNOSTICO': return '#F1C40F';
            case 'EN_REPARACION': return '#E67E22';
            case 'LISTO_ENTREGA': return '#2ECC71';
            case 'ENTREGADO': return '#95A5A6';
            default: return '#7F8C8D';
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isAdmin && (
                <TouchableOpacity 
                    style={styles.adminPanelButton}
                    onPress={() => navigation.navigate('UserManagement')}
                >
                    <Text style={styles.adminPanelText}>⚙️ PANEL DE GESTIÓN DE TÉCNICOS</Text>
                </TouchableOpacity>
            )}

            <View style={styles.searchContainer}>
                <View style={[styles.searchPill, { backgroundColor: isDark ? colors.card : '#E8EAED' }]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Buscar órdenes..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.filterBadge, 
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            !selectedStatus && styles.filterBadgeActive
                        ]}
                        onPress={() => setSelectedStatus(null)}
                    >
                        <Text style={[styles.filterText, !selectedStatus && styles.filterTextActive]}>Todos</Text>
                    </TouchableOpacity>
                    {statusOptions.map((status) => (
                        <TouchableOpacity 
                            key={status}
                            style={[
                                styles.filterBadge, 
                                { backgroundColor: colors.surface, borderColor: colors.border },
                                selectedStatus === status && styles.filterBadgeActive
                            ]}
                            onPress={() => setSelectedStatus(status)}
                        >
                            <Text style={[styles.filterText, selectedStatus === status && styles.filterTextActive]}>
                                {formatStatus(status)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={[styles.listWrapper, { backgroundColor: colors.surface }]}>
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.background }]} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No se encontraron órdenes</Text>
                    }
                />
            </View>
            
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('CreateOrder')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    adminPanelButton: {
        backgroundColor: '#FFE58F',
        padding: 12,
        alignItems: 'center',
        marginHorizontal: 24,
        marginTop: 10,
        borderRadius: 16,
    },
    adminPanelText: {
        fontWeight: 'bold',
        color: '#1A1A1A',
        fontSize: 12,
    },
    searchContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    searchPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 48,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterWrapper: {
        height: 40,
        marginBottom: 16,
    },
    filterContainer: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    filterBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        borderWidth: 1,
    },
    filterBadgeActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterText: {
        fontSize: 13,
        color: '#757575',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    listWrapper: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    listContent: {
        paddingVertical: 16,
    },
    orderItem: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    orderIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    orderIconText: {
        fontSize: 24,
    },
    orderInfo: {
        flex: 1,
    },
    orderMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
    },
    orderId: {
        fontSize: 13,
    },
    orderSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deviceInfo: {
        fontSize: 13,
        flex: 1,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        marginLeft: 88,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    fabIcon: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '300',
    },
});

export default OrderListScreen;
