// components/SpeechBubble.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '@/constants/Fonts';

interface SpeechBubbleProps {
    title?: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onPress: () => void;
    buttonText: string;
    showTitle?: boolean;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
                                                       title,
                                                       placeholder,
                                                       value,
                                                       onChangeText,
                                                       onPress,
                                                       buttonText,
                                                       showTitle = true,
                                                   }) => {
    return (
        <View style={styles.speechBubbleContainer}>
            <View style={styles.shadowContainer}>
                <LinearGradient
                    colors={['#FFE4E1', '#FAF0E6']}
                    style={styles.speechBubble}
                >
                    {showTitle && (
                        <View style={styles.titleContainer}>
                            <Ionicons name="heart" size={20} color="#FF69B4" />
                            <Text style={[styles.title, { fontFamily: FontFamily.bold }]}>{title}</Text>
                        </View>
                    )}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.textInputFixed, { fontFamily: FontFamily.regular }]}
                            placeholder={placeholder}
                            placeholderTextColor="#999"
                            value={value}
                            onChangeText={onChangeText}
                            multiline
                            textAlignVertical="top"
                            maxLength={200}
                            scrollEnabled={true}
                            editable={true}
                            returnKeyType="send"
                            onKeyPress={({nativeEvent}) => {
                                if (nativeEvent.key === 'Enter') {
                                    onPress();
                                }
                            }}
                        />
                        <Text style={styles.charCount}>{value.length}/200</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onPress}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FF69B4', '#FF1493']}
                            style={styles.gradientButton}
                        >
                            <Text style={[styles.buttonText, { fontFamily: FontFamily.semiBold }]}>{buttonText}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
            <View style={styles.triangleDown} />
        </View>
    );
};

const styles = StyleSheet.create({
    speechBubbleContainer: {
        alignItems: 'center',
        width: '100%',
        marginVertical: 5,
    },
    shadowContainer: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 20,
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    speechBubble: {
        borderRadius: 20,
        padding: 10,
        width: '100%',
        overflow: 'hidden',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    inputContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    textInputFixed: {
        height: 65,
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    charCount: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        fontSize: 12,
        color: '#666',
    },
    gradientButton: {
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 25,
    },
    button: {
        alignSelf: 'center',
        borderRadius: 25,
        overflow: 'hidden',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    triangleDown: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FAF0E6',
    },
});

export default SpeechBubble;
