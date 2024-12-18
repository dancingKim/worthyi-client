import React from "react";
import { View, Text, StyleSheet, Image, SafeAreaView } from "react-native";
import SocialLoginButton from '@/components/buttons/SocialLoginButton'
import {handleSocialLogin}from '@/utils/api';
import {useAuth} from "@/context/AuthContext";
const LoginScreen: React.FC = () => {
    const {login} = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <Image 
                    source={require("@/assets/images/Worthy-I-logo.png")}
                    style={styles.logo}
                />
                <Text style={styles.title}>환영합니다!</Text>
                <Text style={styles.subtitle}>
                    로그인하고 다양한 서비스를 이용해보세요
                </Text>
                
                <View style={[styles.buttonContainer, { marginVertical: 8 }]}>
                    <SocialLoginButton
                        provider="google"
                        onPress={() => handleSocialLogin("google", login)}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: '#333333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 40,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 320,
    },
    socialButton: {
        marginVertical: 8,
    },
});

export default LoginScreen;
