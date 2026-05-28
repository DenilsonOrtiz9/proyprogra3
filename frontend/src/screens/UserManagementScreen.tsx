import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { getUsers, createUser, deleteUser } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';

const UserManagementScreen = () => {
    const { userRole } = useAuth();
    const { colors, isDark } = useTheme();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!username || !password || !fullName) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        setCreating(true);
        try {
            await createUser({
                username,
                password,
                fullName,
                role: 'TECHNICIAN'
            }, userRole || '');
            Alert.alert('Éxito', 'Usuario creado correctamente');
            setUsername('');
            setPassword('');
            setFullName('');
            loadUsers();
        } catch (error: any) {
            const errorMsg = error.response?.data || 'No se pudo crear el usuario';
            Alert.alert('Error', errorMsg);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = (id: number, name: string) => {
        Alert.alert(
            'Confirmar',
            `¿Estás seguro de que deseas eliminar a ${name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUser(id, userRole || '');
                            loadUsers();
                        } catch (error: any) {
                            const errorMsg = error.response?.data || 'No se pudo eliminar el usuario';
                            Alert.alert('Error', errorMsg);
                        }
                    }
                }
            ]
        );
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.userItem}>
            <View style={[styles.userIconContainer, { backgroundColor: colors.background }]}>
                <Text style={styles.userIconText}>👤</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.fullName}</Text>
                <Text style={[styles.userUsername, { color: colors.textSecondary }]}>@{item.username}</Text>
            </View>
            {item.username !== 'admin' && (
                <TouchableOpacity 
                    style={[styles.deleteButton, { backgroundColor: isDark ? '#3D1A1A' : '#FEECEC' }]}
                    onPress={() => handleDeleteUser(item.id, item.fullName)}
                >
                    <Text style={[styles.deleteButtonText, { color: isDark ? '#FF6B6B' : '#E74C3C' }]}>Eliminar</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Técnicos</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gestión de personal de servicio</Text>
            </View>

            <View style={[styles.content, { backgroundColor: colors.surface }]}>
                <View style={styles.formCard}>
                    <Text style={[styles.formTitle, { color: colors.textSecondary }]}>Registrar Nuevo</Text>
                    <View style={[styles.inputGroup, { backgroundColor: colors.background }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Nombre Completo"
                            placeholderTextColor={colors.textSecondary}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Usuario"
                            placeholderTextColor={colors.textSecondary}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Contraseña"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                    <TouchableOpacity 
                        style={[styles.createButton, { backgroundColor: colors.primary }]}
                        onPress={handleCreateUser}
                        disabled={creating}
                    >
                        {creating ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.createButtonText}>Agregar Técnico</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={[styles.listTitle, { color: colors.textSecondary }]}>Lista de Personal</Text>
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUserItem}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={[styles.listSeparator, { backgroundColor: colors.background }]} />}
                />
            </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formCard: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    formTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
        textTransform: 'uppercase',
        marginLeft: 8,
    },
    inputGroup: {
        borderRadius: 24,
        paddingVertical: 4,
        marginBottom: 16,
    },
    input: {
        height: 52,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    separator: {
        height: 1,
        marginHorizontal: 20,
    },
    createButton: {
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    listTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 16,
        textTransform: 'uppercase',
        marginLeft: 32,
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    userItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
    },
    userIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    userIconText: {
        fontSize: 20,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userUsername: {
        fontSize: 13,
    },
    deleteButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    deleteButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    listSeparator: {
        height: 1,
        marginLeft: 60,
    },
});

export default UserManagementScreen;
