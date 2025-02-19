import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import * as AppleAuthentication from 'expo-apple-authentication';

interface Props {
    provider: string;
    onPress: () => void;
}

const SocialLoginButton: React.FC<Props> = ({ provider, onPress }) => {
    if (provider === "apple") {
        return (
            <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={5}
                style={styles.appleButton}
                onPress={onPress}
            />
        );
    }
    
    
    const capitalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);

    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{capitalizedProvider}로 로그인</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#4285F4",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
        width: '100%',
        maxWidth: 320,
        height: 50,
    },
    appleButton: {
        width: '100%',
        maxWidth: 320,
        height: 50,
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default SocialLoginButton;
