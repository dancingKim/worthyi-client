// src/utils/errorHandler.ts

import { Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export const handleError = (error: any, logout: () => Promise<void>) => {
    if (error.status === 401) {
        Alert.alert('인증 오류', '로그인이 필요합니다.');
        logout();
    } else if (error.message === 'Network request failed') {
        Alert.alert('네트워크 오류', '인터넷 연결을 확인해주세요.');
    } else {
        Alert.alert('오류', error.message || '알 수 없는 오류가 발생했습니다.');
    }
};
