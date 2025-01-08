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
                style={styles.button}
                onPress={onPress}
            />
        );
    }

    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{provider}로 로그인</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#4285F4",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginVertical: 10,
        width: '100%',
        maxWidth: 320,
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default SocialLoginButton;
