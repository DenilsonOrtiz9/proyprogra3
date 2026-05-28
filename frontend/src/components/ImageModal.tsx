import React from 'react';
import { Modal, View, Image, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';

interface ImageModalProps {
    visible: boolean;
    imageUrl: string | null;
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const ImageModal: React.FC<ImageModalProps> = ({ visible, imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
                <View style={styles.content}>
                    <Image 
                        source={{ uri: imageUrl }} 
                        style={styles.image} 
                        resizeMode="contain" 
                    />
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width * 0.95,
        height: height * 0.8,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '600',
    },
});

export default ImageModal;
