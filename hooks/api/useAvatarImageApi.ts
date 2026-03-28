import Constants from 'expo-constants';
import { useApiGeneric } from './useApiGeneric';
import { ApiResponse, AvatarImageCollectionResponse } from '@/types/types';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const useAvatarImageApi = () => {
  const listApi = useApiGeneric<null, ApiResponse<AvatarImageCollectionResponse>>({
    method: 'GET',
    url: `${BASE_URL}/avatar-images`,
    condition: true,
  });

  const generateApi = useApiGeneric<any, ApiResponse<AvatarImageCollectionResponse>>({
    method: 'POST',
    url: `${BASE_URL}/avatar-images/generate`,
    condition: true,
  });

  const setActiveApi = useApiGeneric<any, ApiResponse<AvatarImageCollectionResponse>>({
    method: 'PATCH',
    url: `${BASE_URL}/avatar-images/active`,
    condition: true,
  });

  const deleteApi = useApiGeneric<null, ApiResponse<AvatarImageCollectionResponse>>({
    method: 'DELETE',
    url: `${BASE_URL}/avatar-images`,
    condition: true,
  });

  return {
    fetchAvatarImages: listApi.execute,
    generateAvatarImage: generateApi.execute,
    setActiveAvatarImage: setActiveApi.execute,
    deleteAvatarImage: deleteApi.execute,
    listState: listApi,
    generateState: generateApi,
    setActiveState: setActiveApi,
    deleteState: deleteApi,
  };
};
