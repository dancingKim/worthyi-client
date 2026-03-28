import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import AvatarArtwork from '@/components/AvatarArtwork';
import { FontFamily } from '@/constants/Fonts';
import { useAuth } from '@/context/AuthContext';
import { useAvatarImageApi } from '@/hooks/api/useAvatarImageApi';
import { AvatarImageCollectionResponse, AvatarImageItem } from '@/types/types';

type ModelPreset = 'BEST' | 'BALANCED' | 'FAST';

const MODEL_PRESETS: Array<{ label: string; value: ModelPreset; description: string }> = [
  { label: 'Best', value: 'BEST', description: '가장 좋은 품질' },
  { label: 'Balanced', value: 'BALANCED', description: '품질과 속도 균형' },
  { label: 'Fast', value: 'FAST', description: '가볍고 빠른 생성' },
];

const AvatarScreen = () => {
  const BASE_URL = Constants.expoConfig?.extra?.BASE_URL ?? '';
  const { user, refreshUser } = useAuth();
  const {
    fetchAvatarImages,
    createAvatarImage,
    setActiveAvatarImage,
    deleteAvatarImage,
    listState,
    createState,
    setActiveState,
    deleteState,
  } = useAvatarImageApi();

  const [avatarCollection, setAvatarCollection] = useState<AvatarImageCollectionResponse | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedReferenceAvatarId, setSelectedReferenceAvatarId] = useState<number | null>(null);
  const [selectedModelPreset, setSelectedModelPreset] = useState<ModelPreset>('BEST');

  const isBusy = listState.isLoading || createState.isLoading || setActiveState.isLoading || deleteState.isLoading;

  const avatarImages = avatarCollection?.avatarImages ?? [];

  const loadAvatarImages = async () => {
    try {
      const response = await fetchAvatarImages();
      if (response?.data) {
        setAvatarCollection(response.data);
      }
    } catch (error) {
      console.error('Failed to load avatar images:', error);
      Alert.alert('오류', '캐릭터 목록을 불러오지 못했어요.');
    }
  };

  useEffect(() => {
    loadAvatarImages();
  }, []);

  const activeAvatarLabel = useMemo(() => {
    if (avatarCollection?.usesDefaultAvatar) {
      return '기본 캐릭터';
    }
    return avatarCollection?.activeAvatarImage?.name ?? '기본 캐릭터';
  }, [avatarCollection]);

  const applyCollection = async (nextCollection: AvatarImageCollectionResponse | null) => {
    if (nextCollection) {
      setAvatarCollection(nextCollection);
      await refreshUser();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('안내', '바꾸고 싶은 내용을 먼저 적어주세요.');
      return;
    }

    try {
      const response = await createAvatarImage({
        prompt: prompt.trim(),
        referenceAvatarImageId: selectedReferenceAvatarId,
        modelPreset: selectedModelPreset,
      });
      setPrompt('');
      await applyCollection(response?.data ?? null);
    } catch (error) {
      console.error('Failed to generate avatar image:', error);
      Alert.alert('오류', '캐릭터를 만드는 중 문제가 발생했어요.');
    }
  };

  const handleSetActive = async (avatarImageId: number | null) => {
    try {
      const response = await setActiveAvatarImage({ avatarImageId });
      await applyCollection(response?.data ?? null);
    } catch (error) {
      console.error('Failed to set active avatar image:', error);
      Alert.alert('오류', '현재 캐릭터를 바꾸지 못했어요.');
    }
  };

  const handleDelete = (avatarImageId: number) => {
    Alert.alert(
      '캐릭터 삭제',
      '이 캐릭터를 정말 삭제할까요? 삭제하면 다시 복구할 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteAvatarImage(null, `${BASE_URL}/user/me/avatar-images/${avatarImageId}`);
              if (selectedReferenceAvatarId === avatarImageId) {
                setSelectedReferenceAvatarId(null);
              }
              await applyCollection(response?.data ?? null);
            } catch (error) {
              console.error('Failed to delete avatar image:', error);
              Alert.alert('오류', '캐릭터를 삭제하지 못했어요.');
            }
          },
        },
      ]
    );
  };

  const renderReferenceChip = (avatarImage?: AvatarImageItem) => {
    const isDefault = !avatarImage;
    const isSelected = isDefault
      ? selectedReferenceAvatarId === null
      : selectedReferenceAvatarId === avatarImage.avatarImageId;

    return (
      <TouchableOpacity
        key={isDefault ? 'default-reference' : avatarImage.avatarImageId}
        style={[styles.referenceCard, isSelected && styles.referenceCardSelected]}
        onPress={() => setSelectedReferenceAvatarId(isDefault ? null : avatarImage.avatarImageId)}
      >
        <View style={styles.referenceArtworkContainer}>
          <AvatarArtwork imageUrl={avatarImage?.imageUrl} style={styles.referenceArtwork} />
        </View>
        <Text style={styles.referenceName}>
          {isDefault ? '기본 캐릭터' : avatarImage.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAvatarLibraryCard = (avatarImage?: AvatarImageItem) => {
    const isDefault = !avatarImage;
    const isActive = isDefault ? !!avatarCollection?.usesDefaultAvatar : avatarImage.active;

    return (
      <View
        key={isDefault ? 'default-avatar-library' : avatarImage.avatarImageId}
        style={[styles.libraryCard, isActive && styles.libraryCardActive]}
      >
        <View style={styles.libraryImageContainer}>
          <AvatarArtwork imageUrl={avatarImage?.imageUrl} style={styles.libraryImage} />
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>사용 중</Text>
            </View>
          )}
          {!isDefault && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(avatarImage.avatarImageId)}>
              <Ionicons name="trash-outline" size={16} color="#FF69B4" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.libraryTitle}>{isDefault ? '기본 캐릭터' : avatarImage.name}</Text>
        <Text style={styles.librarySubtitle}>
          {isDefault ? '앱 기본 캐릭터' : avatarImage.generationModel}
        </Text>

        {!isDefault && !!avatarImage.prompt && (
          <Text style={styles.libraryPrompt} numberOfLines={2}>
            {avatarImage.prompt}
          </Text>
        )}

        <View style={styles.libraryActions}>
          <TouchableOpacity
            style={[styles.secondaryActionButton, !isDefault && styles.secondaryActionButtonMuted]}
            onPress={() => setSelectedReferenceAvatarId(isDefault ? null : avatarImage.avatarImageId)}
          >
            <Text style={styles.secondaryActionText}>참고로 사용</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => handleSetActive(isDefault ? null : avatarImage.avatarImageId)}
          >
            <Text style={styles.primaryActionText}>{isActive ? '현재 선택됨' : '사용하기'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>현재 캐릭터</Text>
          <View style={styles.heroArtworkWrap}>
            <AvatarArtwork imageUrl={user?.activeAvatarImage?.imageUrl} style={styles.heroArtwork} />
          </View>
          <Text style={styles.heroTitle}>{activeAvatarLabel}</Text>
          <Text style={styles.heroDescription}>
            기본 캐릭터 또는 내가 만든 캐릭터를 골라서 홈 화면에 바로 반영할 수 있어요.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>참고 캐릭터 선택</Text>
          <Text style={styles.sectionDescription}>
            기본 캐릭터나 기존 캐릭터를 참고로 삼아서 눈 색, 머리색 같은 변경을 이어서 만들 수 있어요.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.referenceRow}>
            {renderReferenceChip()}
            {avatarImages.map((avatarImage) => renderReferenceChip(avatarImage))}
          </ScrollView>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>새 캐릭터 만들기</Text>

          <View style={styles.modelRow}>
            {MODEL_PRESETS.map((preset) => {
              const selected = selectedModelPreset === preset.value;
              return (
                <TouchableOpacity
                  key={preset.value}
                  style={[styles.modelChip, selected && styles.modelChipSelected]}
                  onPress={() => setSelectedModelPreset(preset.value)}
                >
                  <Text style={[styles.modelChipLabel, selected && styles.modelChipLabelSelected]}>
                    {preset.label}
                  </Text>
                  <Text style={[styles.modelChipDescription, selected && styles.modelChipDescriptionSelected]}>
                    {preset.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.promptInput}
            multiline
            placeholder="예: 눈 색을 에메랄드색으로 바꿔줘. 배경은 투명하게 유지해줘."
            placeholderTextColor="#B88BA3"
            value={prompt}
            onChangeText={setPrompt}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={isBusy}>
            {createState.isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.generateButtonText}>새 캐릭터 만들기</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>내 캐릭터 보관함</Text>
          <View style={styles.libraryGrid}>
            {renderAvatarLibraryCard()}
            {avatarImages.map((avatarImage) => renderAvatarLibraryCard(avatarImage))}
          </View>
        </View>

        {listState.isLoading && !avatarCollection && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FF69B4" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AvatarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  heroCard: {
    backgroundColor: '#FFF6FA',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  heroLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: '#B55C8D',
    marginBottom: 12,
  },
  heroArtworkWrap: {
    width: 180,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
  },
  heroArtwork: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  heroTitle: {
    marginTop: 16,
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: '#2F2430',
  },
  heroDescription: {
    marginTop: 8,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    color: '#6D5462',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFF0F5',
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: '#2F2430',
  },
  sectionDescription: {
    marginTop: 8,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#755D6A',
  },
  referenceRow: {
    gap: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  referenceCard: {
    width: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  referenceCardSelected: {
    borderColor: '#FF69B4',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  referenceArtworkContainer: {
    width: '100%',
    aspectRatio: 0.76,
    borderRadius: 14,
    backgroundColor: '#FFF8FB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  referenceArtwork: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  referenceName: {
    marginTop: 10,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: '#51404A',
    textAlign: 'center',
  },
  modelRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  modelChip: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F4CEDD',
  },
  modelChipSelected: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF69B4',
  },
  modelChipLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: '#5B4150',
    textAlign: 'center',
  },
  modelChipLabelSelected: {
    color: '#FFFFFF',
  },
  modelChipDescription: {
    marginTop: 4,
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#8A6B79',
    textAlign: 'center',
  },
  modelChipDescriptionSelected: {
    color: '#FFE7F3',
  },
  promptInput: {
    marginTop: 16,
    minHeight: 128,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: '#332831',
    lineHeight: 22,
  },
  generateButton: {
    marginTop: 14,
    backgroundColor: '#FF69B4',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  libraryGrid: {
    marginTop: 16,
    gap: 14,
  },
  libraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
  },
  libraryCardActive: {
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  libraryImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.76,
    backgroundColor: '#FFF8FB',
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  activeBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: '#FF69B4',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryTitle: {
    marginTop: 14,
    fontFamily: FontFamily.bold,
    fontSize: 17,
    color: '#342630',
  },
  librarySubtitle: {
    marginTop: 4,
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: '#A26C88',
  },
  libraryPrompt: {
    marginTop: 10,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: '#5D4754',
  },
  libraryActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#FFF0F5',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButtonMuted: {
    borderWidth: 1,
    borderColor: '#F7C6DB',
  },
  secondaryActionText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: '#A3547D',
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#FF69B4',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
