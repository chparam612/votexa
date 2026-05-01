import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../firebase";

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      console.log("User signed in securely.");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-900 px-6">
      <Text className="text-4xl font-bold text-white mb-2">Votexa</Text>
      <Text className="text-gray-400 mb-12 text-center text-lg">
        Secure Election Platform
      </Text>

      <View className="w-full max-w-sm bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-xl items-center">
        <Text className="text-white text-xl font-semibold mb-6">
          Identity Verification
        </Text>

        {error && (
          <Text className="text-red-400 mb-4 text-center">{error}</Text>
        )}

        <TouchableOpacity
          className="bg-indigo-600 px-6 py-4 rounded-xl items-center w-full flex-row justify-center"
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Authenticate Securely
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-gray-500 text-xs text-center mt-6">
          By authenticating, you agree to the Terms of Service and Privacy
          Policy. Your session will be securely connected to the Local Firebase
          Auth Emulator.
        </Text>
      </View>
    </View>
  );
}
