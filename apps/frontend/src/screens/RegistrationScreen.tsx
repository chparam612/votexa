import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ElectionState } from "@votexa/algorithms";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function RegistrationScreen() {
  const { currentState } = useSelector((state: RootState) => state.election);
  const [region, setRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!region) {
      setError("Please enter your region.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      await setDoc(doc(db, "users", user.uid), {
        region,
        registeredAt: new Date(),
        status: "REGISTERED",
      }, { merge: true });

      setRegistered(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentState !== ElectionState.REGISTRATION_OPEN) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 px-6">
        <Text className="text-3xl font-bold text-red-500 mb-4">
          Registration Locked 🔒
        </Text>
        <Text className="text-gray-400 text-center">
          Voter registration is currently {currentState.replace('_', ' ')}. Please wait for the
          election administrators to open the registration window.
        </Text>
      </View>
    );
  }

  if (registered) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 px-6">
        <Text className="text-4xl mb-4">✅</Text>
        <Text className="text-2xl font-bold text-green-400 mb-2">
          Registered Successfully!
        </Text>
        <Text className="text-gray-400 text-center">
          You are now eligible to vote when the polls open. Your status has been synced with the blockchain.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-900 px-6">
      <Text className="text-3xl font-bold text-white mb-2 text-center">
        Voter Registration
      </Text>
      <Text className="text-gray-400 mb-8 text-center">
        Enter your details to register for the upcoming election. This process is secured by Votexa's Risk Engine.
      </Text>

      <View className="w-full max-w-sm">
        <Text className="text-gray-300 font-semibold mb-2">
          Registered Region / State
        </Text>
        <TextInput
          className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 mb-2"
          placeholder="e.g. California"
          placeholderTextColor="#9CA3AF"
          value={region}
          onChangeText={setRegion}
        />
        
        {error && (
          <Text className="text-red-500 text-xs mb-4 font-bold">{error}</Text>
        )}

        <TouchableOpacity
          className="bg-indigo-600 px-6 py-4 rounded-xl items-center mt-4"
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Complete Registration
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
