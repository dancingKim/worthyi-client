// components/SpeechBubble.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface SpeechBubbleProps {
    title?: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onPress: () => void;
    buttonText: string;
    showTitle?: boolean;
}

const TriangleDown = () => (
    <View style={styles.triangleDown}></View>
);

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
            <View style={styles.speechBubble}>
                {showTitle && <Text style={styles.title}>{title}</Text>}
                <TextInput
                    style={styles.textInputFixed}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    multiline
                    textAlignVertical="top"
                    maxLength={200}
                    scrollEnabled={true}
                    editable={true}
                    keyboardType="default"
                />
                <TouchableOpacity style={styles.button} onPress={onPress}>
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
            </View>
            <TriangleDown />
        </View>
    );
};

const styles = StyleSheet.create({
    speechBubbleContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    speechBubble: {
        backgroundColor: '#FAF0E6',
        borderRadius: 15,
        padding: 10,
        width: '80%',
        maxWidth: 350,
        alignSelf: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    triangleDown: {
        width: 0,
        height: 0,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 15,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FAF0E6',
        marginTop: -1,
    },
    title: {
        fontSize: 18,
        marginBottom: 5,
        textAlign: 'center',
    },
    textInputFixed: {
        height: 80,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        width: '100%',
        marginBottom: 10,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
        overflow: 'hidden',
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 5,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default SpeechBubble;
