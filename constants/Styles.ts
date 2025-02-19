import { StyleSheet } from 'react-native';
import { FontFamily } from './Fonts';

export const CommonStyles = StyleSheet.create({
  text: {
    fontFamily: FontFamily.regular
  },
  heading1: {
    fontFamily: FontFamily.bold,
    fontSize: 24
  },
  heading2: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20
  },
  button: {
    fontFamily: FontFamily.medium,
    fontSize: 16
  },
  caption: {
    fontFamily: FontFamily.light,
    fontSize: 12
  }
});