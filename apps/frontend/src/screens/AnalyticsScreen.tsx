import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface Tally {
  [candidateName: string]: number;
}

interface RiskStats {
  low: number;
  medium: number;
  high: number;
}

export default function AnalyticsScreen() {
  const [tally, setTally] = useState<Tally>({});
  const [riskStats, setRiskStats] = useState<RiskStats>({ low: 0, medium: 0, high: 0 });
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for all votes
    const unsubscribe = onSnapshot(collection(db, "votes"), 
      (snapshot) => {
        const newTally: Tally = {};
        const newRisk: RiskStats = { low: 0, medium: 0, high: 0 };
        let total = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Tally Votes
          const candidate = data.candidate;
          if (candidate) {
            newTally[candidate] = (newTally[candidate] || 0) + 1;
            total += 1;
          }

          // Tally Risk
          const level = data.riskLevel;
          if (level === 'LOW') newRisk.low += 1;
          else if (level === 'MEDIUM') newRisk.medium += 1;
          else if (level === 'HIGH') newRisk.high += 1;
        });

        setTally(newTally);
        setRiskStats(newRisk);
        setTotalVotes(total);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to votes:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const candidates = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);

  return (
    <ScrollView 
      className="flex-1 bg-gray-900 px-6 pt-6"
      refreshControl={<RefreshControl refreshing={isLoading} tintColor="#6366f1" />}
    >
      <View className="mb-8">
        <Text className="text-3xl font-black text-white">Live Analytics</Text>
        <Text className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Voter Intelligence Dashboard</Text>
      </View>

      {/* SUMMARY CARDS */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1 bg-gray-800 p-5 rounded-3xl border border-gray-700 items-center">
          <Text className="text-gray-500 text-[10px] font-black uppercase mb-1">Total Votes</Text>
          <Text className="text-white text-3xl font-black">{totalVotes}</Text>
        </View>
        <View className="flex-1 bg-gray-800 p-5 rounded-3xl border border-gray-700 items-center">
          <Text className="text-gray-500 text-[10px] font-black uppercase mb-1">Integrity Rate</Text>
          <Text className="text-emerald-400 text-3xl font-black">
            {totalVotes > 0 ? Math.round((riskStats.low / totalVotes) * 100) : 100}%
          </Text>
        </View>
      </View>

      {/* CANDIDATE TALLY */}
      <Text className="text-white font-black text-lg mb-4">Official Results</Text>
      <View className="bg-gray-800 p-6 rounded-3xl border border-gray-700 mb-8">
        {candidates.length === 0 && !isLoading && (
          <Text className="text-gray-600 text-center py-4 font-bold italic">No ballots cast yet.</Text>
        )}
        {candidates.map((candidate, index) => {
          const votes = tally[candidate];
          const percentage = ((votes / totalVotes) * 100).toFixed(1);
          const isLeader = index === 0;

          return (
            <View key={candidate} className="mb-6 last:mb-0">
              <View className="flex-row justify-between mb-2 items-end">
                <Text className={`font-black text-base ${isLeader ? "text-white" : "text-gray-400"}`}>
                  {candidate} {isLeader && "👑"}
                </Text>
                <Text className="text-gray-500 font-bold text-xs">
                  {votes} ({percentage}%)
                </Text>
              </View>
              <View className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                <View 
                  className={`h-full rounded-full ${isLeader ? "bg-indigo-500" : "bg-gray-700"}`}
                  style={{ width: `${percentage}%` }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* RISK DISTRIBUTION */}
      <Text className="text-white font-black text-lg mb-4">Risk Distribution</Text>
      <View className="bg-gray-800 p-6 rounded-3xl border border-gray-700 mb-10">
        <View className="flex-row h-12 rounded-2xl overflow-hidden mb-6">
          <View style={{ flex: riskStats.low || 1 }} className="bg-emerald-500 h-full" />
          <View style={{ flex: riskStats.medium || 0 }} className="bg-yellow-500 h-full" />
          <View style={{ flex: riskStats.high || 0 }} className="bg-red-500 h-full" />
        </View>
        
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-emerald-400 font-black text-lg">{riskStats.low}</Text>
            <Text className="text-gray-500 text-[10px] font-bold">LOW</Text>
          </View>
          <View className="items-center">
            <Text className="text-yellow-400 font-black text-lg">{riskStats.medium}</Text>
            <Text className="text-gray-500 text-[10px] font-bold">MEDIUM</Text>
          </View>
          <View className="items-center">
            <Text className="text-red-400 font-black text-lg">{riskStats.high}</Text>
            <Text className="text-gray-500 text-[10px] font-bold">HIGH</Text>
          </View>
        </View>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
}
