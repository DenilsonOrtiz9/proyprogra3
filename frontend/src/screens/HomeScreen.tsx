import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../services/ThemeContext';

type RootStackParamList = {
    Home: undefined;
    OrderList: undefined;
    ClientTracking: undefined;
    Login: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors, isDark, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* One UI Large Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity 
                    style={styles.themeToggle} 
                    onPress={toggleTheme}
                    activeOpacity={0.7}
                >
                    <Text style={styles.themeToggleText}>{isDark ? '☀️' : '🌙'}</Text>
                </TouchableOpacity>
                
                <View style={styles.brandContainer}>
                    <Image 
                        source={require('../../assets/icon.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, { color: colors.text }]}>LUDERO IT</Text>
                </View>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gestión de Equipos</Text>
            </View>

            <View style={[styles.content, { backgroundColor: colors.surface }]}>
                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.infoTitle, { color: colors.text }]}>Bienvenido</Text>
                    <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
                        Acceda a su cuenta de técnico para gestionar reparaciones o consulte el estado de su equipo.
                    </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Acceso Rápido</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.categoryCard, { backgroundColor: colors.card }]} 
                        onPress={() => navigation.navigate('Login')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1A237E' : '#E3F2FD' }]}>
                            <Text style={styles.iconText}>🛠️</Text>
                        </View>
                        <Text style={[styles.categoryText, { color: colors.text }]}>Soy Técnico</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.categoryCard, { backgroundColor: colors.card }]} 
                        onPress={() => navigation.navigate('ClientTracking')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1B5E20' : '#E8F5E9' }]}>
                            <Text style={styles.iconText}>🔍</Text>
                        </View>
                        <Text style={[styles.categoryText, { color: colors.text }]}>Consultar Orden</Text>
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
        height: '35%',
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    themeToggle: {
        position: 'absolute',
        top: 60,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    themeToggleText: {
        fontSize: 24,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    logo: {
        width: 44,
        height: 44,
        marginRight: 12,
        borderRadius: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        marginLeft: 56, // Align with title text (logo width 44 + margin 12)
    },
    content: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    categoryCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconText: {
        fontSize: 24,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    infoCard: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    infoDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
});

export default HomeScreen;
