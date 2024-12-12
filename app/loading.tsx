import {ActivityIndicator, Text, View} from "react-native";
import React from "react";

export default function Loading() {
    return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text>Loading...</Text>
            </View>
    );
}
