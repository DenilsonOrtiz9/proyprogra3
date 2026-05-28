import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createOrder, uploadEvidence } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../services/ThemeContext';

const CreateOrderScreen = () => {
    const [clienteNombre, setClienteNombre] = useState('');
    const [dispositivo, setDispositivo] = useState('');
    const [descripcionProblema, setDescripcionProblema] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.5,
            allowsEditing: false,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!clienteNombre || !dispositivo || !descripcionProblema) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        if (!imageUri) {
            Alert.alert('Evidencia requerida', 'Debe capturar al menos una fotografía como evidencia inicial para crear la orden.');
            return;
        }

        setLoading(true);
        try {
            const newOrder = await createOrder({
                clienteNombre,
                dispositivo,
                descripcionProblema
            });

            await uploadEvidence(newOrder.id, imageUri);

            Alert.alert('Éxito', 'Orden creada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo crear la orden');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Nueva Orden</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Complete los datos del equipo</Text>
            </View>

            <View style={[styles.content, { backgroundColor: colors.surface }]}>
                <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Cliente</Text>
                        <TextInput 
                            style={[styles.input, { color: colors.text }]} 
                            value={clienteNombre} 
                            onChangeText={setClienteNombre}
                            placeholder="Nombre completo"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Dispositivo</Text>
                        <TextInput 
                            style={[styles.input, { color: colors.text }]} 
                            value={dispositivo} 
                            onChangeText={setDispositivo}
                            placeholder="Marca y modelo"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                </View>

                <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Descripción del Problema</Text>
                        <TextInput 
                            style={[styles.input, styles.textArea, { color: colors.text }]} 
                            value={descripcionProblema} 
                            onChangeText={setDescripcionProblema}
                            placeholder="Detalle la falla reportada..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Evidencia</Text>
                <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.background }]} onPress={takePhoto}>
                    <Text style={styles.photoIcon}>📷</Text>
                    <Text style={[styles.photoButtonText, { color: colors.text }]}>Capturar evidencia</Text>
                </TouchableOpacity>

                {imageUri && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: imageUri }} style={[styles.previewImage, { backgroundColor: colors.border }]} />
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Guardando...' : 'Crear Orden'}
                    </Text>
                </TouchableOpacity>
            </View>
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
        paddingTop: 20,
        paddingBottom: 32,
        paddingHorizontal: 24,
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
        paddingTop: 32,
    },
    inputGroup: {
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
    },
    inputWrapper: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        paddingVertical: 8,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    separator: {
        height: 1,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    photoButton: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    photoIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    photoButtonText: {
        fontWeight: '600',
        fontSize: 15,
    },
    previewContainer: {
        marginBottom: 24,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 2,
    },
    previewImage: {
        width: '100%',
        height: 200,
    },
    saveButton: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        elevation: 2,
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CreateOrderScreen;
