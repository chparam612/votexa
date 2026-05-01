import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ElectionState } from "@votexa/algorithms";
import { doc, onSnapshot, collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const CANDIDATES = ["Alice Smith", "Bob Johnson", "Charlie Brown"];

export default function VotingScreen() {
  const { currentState } = useSelector((state: RootState) => state.election);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voteId, setVoteId] = useState<string | null>(null);
  const [riskInfo, setRiskInfo] = useState<{ score: number; level: string; flags: string[] } | null>(null);

  // Listen for Risk Engine results after voting
  useEffect(() => {
    if (voteId) {
      const unsubscribe = onSnapshot(doc(db, "votes", voteId), (snapshot) => {
        const data = snapshot.data();
        if (data?.riskScore !== undefined) {
          setRiskInfo({
            score: data.riskScore,
            level: data.riskLevel,
            flags: data.flags || [],
          });
        }
      });
      return () => unsubscribe();
    }
  }, [voteId]);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      
      const docRef = await addDoc(collection(db, "votes"), {
        userId: user?.uid || "anonymous",
        candidate: selectedCandidate,
        voterRegisteredRegion: "NY",
        ipRegion: "NY", // Matches -> Low risk
        deviceVoteCount: 1,
        failedAuthAttempts: 0,
        timeElapsedSinceRegistrationMs: 300000, // 5 minutes
        timestamp: new Date(),
        status: "SUBMITTED",
      });

      setVoteId(docRef.id);
    } catch (err) {
      console.error("Voting error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentState !== ElectionState.VOTING_OPEN && !voteId) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 px-6">
        <Text className="text-3xl font-bold text-red-500 mb-4 text-center">
          Polls Locked 🔒
        </Text>
        <Text className="text-gray-400 text-center">
          Voting is currently {currentState.replace('_', ' ')}. You can only cast a ballot when
          the election administrators open the polls.
        </Text>
      </View>
    );
  }

  if (voteId) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 px-6">
        <Text className="text-6xl mb-6">🗳️</Text>
        <Text className="text-3xl font-black text-white mb-2">Vote Submitted</Text>
        <Text className="text-gray-400 text-center mb-8">
          Your choice of <Text className="text-indigo-400 font-bold">{selectedCandidate}</Text> has been recorded on the secure ledger.
        </Text>

        {riskInfo ? (
          <View className="w-full bg-gray-800 p-6 rounded-2xl border border-gray-700 items-center">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Risk Engine Verification</Text>
            <View className={`px-4 py-1 rounded-full mb-3 ${riskInfo.level === 'LOW' ? 'bg-emerald-600' : 'bg-red-600'}`}>
              <Text className="text-white font-black text-xs">{riskInfo.level} RISK</Text>
            </View>
            <Text className="text-white text-sm font-medium">Confidence Score: {100 - riskInfo.score}%</Text>
            {riskInfo.flags.length > 0 && (
              <Text className="text-red-400 text-[10px] mt-2 font-bold italic">Flags: {riskInfo.flags.join(', ')}</Text>
            )}
          </View>
        ) : (
          <View className="flex-row items-center">
            <ActivityIndicator color="#6366f1" className="mr-3" />
            <Text className="text-gray-500 font-bold">Risk Engine analyzing...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-900 px-6">
      <View className="mb-8 items-center">
        <Text className="text-3xl font-black text-white text-center">Official Ballot</Text>
        <Text className="text-gray-400 text-center mt-1">Select your representative carefully</Text>
      </View>

      <View className="w-full max-w-sm mb-8">
        {CANDIDATES.map((candidate) => (
          <TouchableOpacity
            key={candidate}
            className={`px-6 py-5 rounded-2xl border mb-4 flex-row items-center justify-between shadow-lg ${
              selectedCandidate === candidate
                ? "bg-indigo-600 border-indigo-400"
                : "bg-gray-800 border-gray-700"
            }`}
            onPress={() => setSelectedCandidate(candidate)}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-lg">{candidate}</Text>
            {selectedCandidate === candidate && (
              <View className="w-5 h-5 bg-white rounded-full items-center justify-center">
                <View className="w-2 h-2 bg-indigo-600 rounded-full" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className={`px-8 py-5 rounded-2xl items-center w-full max-w-sm shadow-2xl ${
          selectedCandidate && !isLoading ? "bg-emerald-600" : "bg-gray-700 opacity-50"
        }`}
        onPress={handleVote}
        disabled={!selectedCandidate || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-black text-lg uppercase tracking-tighter">Cast Secure Vote</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
