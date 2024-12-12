// import React, { useEffect } from "react";
// import { View, Text, StyleSheet, Alert } from "react-native";
// import * as Linking from "expo-linking";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "expo-router";
//
// const SocialLoginScreen: React.FC = () => {
//     const { login } = useAuth();
//     const router = useRouter();
//
//     useEffect(() => {
//         const handleLogin = async () => {
//             try {
//                 // 리디렉션된 URL 가져오기
//                 const initialUrl = await Linking.getInitialURL();
//                 if (initialUrl) {
//                     const data = Linking.parse(initialUrl);
//
//                     // token 처리
//                     const rawToken = data.queryParams?.token;
//                     const token = typeof rawToken === "string"
//                         ? rawToken
//                         : Array.isArray(rawToken)
//                             ? rawToken[0]
//                             : undefined;
//
//                     if (token) {
//                         console.log("토큰 추출 성공:", token);
//                         // AuthProvider의 login 함수 호출
//                         await login(token);
//
//                         Alert.alert("로그인 성공", "로그인이 완료되었습니다.");
//                         router.push("/"); // 메인 화면으로 이동
//                     } else {
//                         console.error("토큰이 URL에 포함되지 않았습니다.");
//                         Alert.alert("로그인 실패", "토큰을 가져오지 못했습니다.");
//                     }
//                 }
//             } catch (error) {
//                 console.error("로그인 처리 중 오류 발생:", error);
//                 Alert.alert("로그인 실패", "문제가 발생했습니다. 다시 시도해주세요.");
//             }
//         };
//
//         handleLogin();
//     }, []);
//
//     return (
//         <View style={styles.container}>
//             <Text style={styles.message}>소셜 로그인 처리 중...</Text>
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     message: {
//         fontSize: 18,
//     },
// });
//
// export default SocialLoginScreen;
