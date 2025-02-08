import React, { useState } from "react";
import { View, Text, StyleSheet, Image, SafeAreaView, ActivityIndicator } from "react-native";
import SocialLoginButton from '@/components/buttons/SocialLoginButton';
import { handleSocialLogin} from '@/utils/api';
import { useAuth } from "@/context/AuthContext";
import { FontFamily } from '@/constants/Fonts';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';

const LoginScreen: React.FC = () => {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (provider: string) => {
        try {
            setIsLoading(true);
            await handleSocialLogin(provider, login);
            router.push('/');
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.contentContainer}>
                    <ActivityIndicator size="large" color="#FF69B4" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <Image 
                    source={require("@/assets/images/Worthy-I-logo.png")}
                    style={styles.logo}
                />
                <Text style={[styles.title, { 
                    fontFamily: FontFamily.extraBold,
                    fontSize: 28 
                }]}>환영합니다!</Text>
                <Text style={[styles.subtitle, { 
                    fontFamily: FontFamily.medium,
                    fontSize: 16 
                }]}>
                    로그인하고 다양한 서비스를 이용해보세요
                </Text>
                
                <View style={styles.buttonContainer}>
                    <SocialLoginButton
                        provider="google"
                        onPress={() => handleLogin("google")}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <SocialLoginButton
                        provider="apple"
                        onPress={() => handleLogin("apple")}
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
        width: 200,
        height: 200,
        resizeMode: 'contain',
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
        alignItems: 'center',
    },
    socialButton: {
        width: '100%',
        maxWidth: 320,
        height: 44,
        marginVertical: 8,
    },
});

export default LoginScreen;
