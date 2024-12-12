import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SocialLoginButton from '@/components/buttons/SocialLoginButton'
import {handleSocialLogin}from '@/utils/api';
import {useAuth} from "@/context/AuthContext";
const LoginScreen: React.FC = () => {
    const {login} = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>로그인</Text>
            {/* 소셜 로그인 버튼 */}
            <SocialLoginButton
                provider="google"
                onPress={() => handleSocialLogin("google", login)}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});

export default LoginScreen;
