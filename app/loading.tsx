import {ActivityIndicator, Text, View} from "react-native";
import React from "react";
import { FontFamily } from '@/constants/Fonts';

export default function Loading() {
    return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text style={{ fontFamily: FontFamily.medium }}>Loading...</Text>
            </View>
    );
}
