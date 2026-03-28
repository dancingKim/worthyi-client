import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const defaultAvatarSource = require('@/assets/images/avatar-girl-transparent.png');

interface AvatarArtworkProps {
  imageUrl?: string | null;
  style: StyleProp<ImageStyle>;
}

export const DEFAULT_AVATAR_SOURCE = defaultAvatarSource;

export default function AvatarArtwork({ imageUrl, style }: AvatarArtworkProps) {
  return (
    <Image
      source={imageUrl ? { uri: imageUrl } : defaultAvatarSource}
      style={style}
    />
  );
}
