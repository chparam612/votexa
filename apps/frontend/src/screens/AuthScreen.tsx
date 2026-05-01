import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
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

      <View className="w-full max-w-sm bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-xl">
        <Text className="text-white text-xl font-semibold mb-6 text-center">
          Identity Verification
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-gray-700 text-white px-4 py-3 rounded-xl mb-3 border border-gray-600"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          secureTextEntry
          className="bg-gray-700 text-white px-4 py-3 rounded-xl mb-4 border border-gray-600"
        />

        {error && (
          <Text className="text-red-400 mb-4 text-center text-sm">{error}</Text>
        )}

        <TouchableOpacity
          className="bg-indigo-600 px-6 py-4 rounded-xl items-center w-full flex-row justify-center mb-3"
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-emerald-700 px-6 py-4 rounded-xl items-center w-full flex-row justify-center"
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">Create Account</Text>
        </TouchableOpacity>

        <Text className="text-gray-500 text-xs text-center mt-6">
          By authenticating, you agree to the Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}
