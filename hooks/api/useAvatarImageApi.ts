import Constants from 'expo-constants';
import { useApiGeneric } from './useApiGeneric';
import { ApiResponse, AvatarImageCollectionResponse } from '@/types/types';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const useAvatarImageApi = () => {
  const listApi = useApiGeneric<null, ApiResponse<AvatarImageCollectionResponse>>({
    method: 'GET',
    url: `${BASE_URL}/user/me/avatar-images`,
    condition: true,
  });

  const createApi = useApiGeneric<any, ApiResponse<AvatarImageCollectionResponse>>({
    method: 'POST',
    url: `${BASE_URL}/user/me/avatar-images`,
    condition: true,
  });

  const setActiveApi = useApiGeneric<any, ApiResponse<AvatarImageCollectionResponse>>({
    method: 'PUT',
    url: `${BASE_URL}/user/me/avatar-image`,
    condition: true,
  });

  const deleteApi = useApiGeneric<null, ApiResponse<AvatarImageCollectionResponse>>({
    method: 'DELETE',
    url: `${BASE_URL}/user/me/avatar-images`,
    condition: true,
  });

  return {
    fetchAvatarImages: listApi.execute,
    createAvatarImage: createApi.execute,
    setActiveAvatarImage: setActiveApi.execute,
    deleteAvatarImage: deleteApi.execute,
    listState: listApi,
    createState: createApi,
    setActiveState: setActiveApi,
    deleteState: deleteApi,
  };
};
