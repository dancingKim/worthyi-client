import ParallaxScrollView from "@/components/ParallaxScrollView";
import {Image, StyleSheet, Text, View, SafeAreaView} from "react-native";
import {ThemedView} from "@/components/ThemedView";
import LogOutButton from "@/components/buttons/LogOutButton";
import {useAuth} from "@/context/AuthContext";

export default function ProfileScreen () {
    const {user, logout} = useAuth();

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
                headerImage={
                    <Image
                        source={{ uri: user?.avatars?.[0]?.appearance || 'https://via.placeholder.com/150' }}
                        style={styles.profileImage}
                    />
                }>
                <ThemedView style={styles.container}>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user?.name || '사용자'}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </View>
                    
                    <LogOutButton onPress={() => logout()} />
                </ThemedView>
            </ParallaxScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 24,
        paddingBottom: 32,
    },
    profileImage: {
        height: 120,
        width: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    profileInfo: {
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
});
