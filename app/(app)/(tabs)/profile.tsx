import ParallaxScrollView from "@/components/ParallaxScrollView";
import {Image, StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Linking, Alert} from "react-native";
import {ThemedView} from "@/components/ThemedView";
import LogOutButton from "@/components/buttons/LogOutButton";
import {useAuth} from "@/context/AuthContext";
import { CommonStyles } from '@/constants/Styles';
import { FontFamily } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import { useApiGeneric } from "@/hooks/api/useApiGeneric";
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL ?? '';


const ProfileScreen = () => {
    const {user, logout} = useAuth();
    const {data, isLoading, error, response, execute} = useApiGeneric({
        method: 'POST',
        url: `${BASE_URL}/auth/logout`,
        condition: true,
    });
    
    const handleLogout = async () => {
        try {
            await execute();
        } catch (error) {
            console.error('Logout execution failed:', error);
        } finally {
            logout();
        }
    };

    // 로그인 상태에 따라 버튼 렌더링
const renderAuthButton = () => {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
  
    if (isLoggedIn) {
      return  (
        <View>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF69B4" />
            <Text style={styles.menuText}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            style={[styles.menuItem, styles.deleteAccount]} 
            onPress={handleDeleteAccount}>
                <Ionicons name="trash-outline" size={24} color="#FF69B4" />
                <Text style={[styles.menuText, styles.menuText]}>
                    계정 삭제</Text>
                    </TouchableOpacity>
        </View>
            );
    } else {
      return (
        <TouchableOpacity 
          onPress={() => router.push('/login')}
          style={styles.menuItem}
        >
        <Ionicons name="log-in-outline" size={24} color="#FF69B4" />
          <Text style={styles.menuText}>로그인</Text>
        </TouchableOpacity>
      );
    }
  };

    const handleNotionPress = () => {
        Linking.openURL('https://worthyilife.notion.site/Worthy-I-128f8a2dfd758048b6b3f4707d1565bf?pvs=4');
    };

    const handleEmailPress = async () => {
        try {
            const canOpen = await Linking.canOpenURL('mailto:worthyilife@gmail.com');
            
            if (canOpen) {
                Linking.openURL('mailto:worthyilife@gmail.com?subject=Worthy-I 의견 보내기');
            } else {
                Alert.alert(
                    "알림",
                    "이메일 앱을 열 수 없습니다. worthyilife@gmail.com으로 직접 이메일을 보내주세요.",
                    [{ text: "확인" }]
                );
            }
        } catch (error) {
            Alert.alert(
                "오류",
                "이메일 앱을 여는 중 문제가 발생했습니다. worthyilife@gmail.com으로 직접 이메일을 보내주세요.",
                [{ text: "확인" }]
            );
        }
    };

    const deleteAccountApi = useApiGeneric({
        method: 'DELETE',
        url: `${BASE_URL}/user/me`,
        condition: true,
    });

    const handleDeleteAccount = () => {
        Alert.alert(
            "계정 삭제",
            "정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
            [
                {
                    text: "아니오",
                    style: "cancel"
                },
                {
                    text: "예",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteAccountApi.execute();
                            logout();
                        } catch (error) {
                            Alert.alert("오류", "계정 삭제 중 문제가 발생했습니다.");
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };
    

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={require('@/assets/images/avatar-girl-transparent.png')}
                        style={styles.profileImage}
                    />
                </View>
                {/* <Text style={styles.name}>{user?.name}</Text> */}
                {/* <Text style={styles.email}>{user?.email}</Text> */}
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={handleNotionPress}>
                    <Ionicons name="document-text-outline" size={24} color="#FF69B4" />
                    <Text style={styles.menuText}>감사일기 노션 템플릿 이용하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleEmailPress}>
                    <Ionicons name="mail-outline" size={24} color="#FF69B4" />
                    <Text style={styles.menuText}>의견 보내기</Text>
                </TouchableOpacity>
                {renderAuthButton()}  
            </View>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 32,
    },
    profileImageContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        backgroundColor: '#fff',
        borderRadius: 75,
        padding: 4,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    name: {
        fontSize: 28,
        fontFamily: FontFamily.bold,
        marginTop: 16,
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
        fontFamily: FontFamily.regular,
        marginTop: 8,
    },
    menuContainer: {
        backgroundColor: '#FFF0F5',
        borderRadius: 16,
        padding: 16,
        marginTop: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    menuText: {
        fontSize: 16,
        fontFamily: FontFamily.medium,
        color: '#333',
        marginLeft: 12,
    },
    deleteAccount: {
        marginTop: 20,
        borderColor: '#FF0000',
        borderWidth: 1,
    },
    deleteAccountText: {
        color: '#FF0000',
    },
});
