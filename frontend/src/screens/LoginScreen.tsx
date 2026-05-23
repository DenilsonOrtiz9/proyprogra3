import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { login } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';

type RootStackParamList = {
    Home: undefined;
    OrderList: undefined;
    Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<NavigationProp>();
    const { login: authLogin } = useAuth();
    const { colors, isDark } = useTheme();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Por favor ingrese usuario y contraseña');
            return;
        }

        setLoading(true);
        try {
            const response = await login(username, password);

            // Guardar en estado global
            authLogin(response.role, response.fullName);

            // Usar replace para que al dar atrás vuelva al Home, no al Login
            navigation.replace('OrderList');
        } catch (error: any) {
            Alert.alert('Error', 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Acceso Técnico</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Inicie sesión para continuar</Text>
            </View>

            <View style={[styles.content, { backgroundColor: colors.surface }]}>
                <View style={styles.formCard}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Usuario"
                            placeholderTextColor={colors.textSecondary}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
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
                        style={[styles.button, { backgroundColor: colors.primary }]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>Volver al inicio</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: '30%',
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    title: {
        fontSize: 30,
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
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    formCard: {
        width: '100%',
    },
    inputContainer: {
        borderRadius: 20,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
    },
    button: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    backButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LoginScreen;
