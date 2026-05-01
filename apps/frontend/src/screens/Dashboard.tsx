import React, { useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootState, AppDispatch } from "../store";
import { fetchDashboard, requestTransition, clearError } from "../store/electionSlice";
import { fetchNotifications } from "../store/notificationSlice";
import { ElectionAction, DecisionEngine, RiskLevel } from "@votexa/algorithms";
import type { RootStackParamList } from "../navigation/AppNavigator";
import FSMStepper from "../components/FSMStepper";
import RiskGauge from "../components/RiskGauge";
import NotificationBell from "../components/NotificationBell";
import ActionCard from "../components/ActionCard";

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

export default function Dashboard() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentState, stats, isLoading, error } = useSelector(
    (state: RootState) => state.election,
  );

  const decisionEngine = useMemo(() => new DecisionEngine(), []);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchNotifications(5));
  }, []);

  const onRefresh = () => {
    dispatch(fetchDashboard());
    dispatch(fetchNotifications(5));
  };

  const handleAction = (action: ElectionAction) => {
    dispatch(clearError());
    dispatch(requestTransition(action));
  };

  // Compute prioritized actions based on current state and dummy risk (for demo)
  const riskLevel = stats.votesCast > 5 ? RiskLevel.MEDIUM : RiskLevel.LOW; // Dummy logic
  const recommendedActions = useMemo(() => {
    const rawActions = decisionEngine.getNextActions(currentState);
    return decisionEngine.prioritizeActions(rawActions, riskLevel);
  }, [currentState, riskLevel]);

  return (
    <ScrollView 
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Text className="text-3xl font-black text-white">Votexa</Text>
          <Text className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Intelligence Center</Text>
        </View>
        <NotificationBell onPress={() => console.log('Open Notifications')} />
      </View>

      {/* FSM PROGRESS */}
      <FSMStepper currentState={currentState} />

      {/* RISK SUMMARY */}
      <RiskGauge score={stats.votesCast > 0 ? (stats.registeredVoters / stats.votesCast) * 10 : 15} level={riskLevel} />

      {/* INTELLIGENT ACTIONS */}
      <Text className="text-white font-black text-lg mb-4">Priority Actions</Text>
      {recommendedActions.map((item) => (
        <ActionCard 
          key={item.id} 
          item={item} 
          onPress={() => handleAction(item.action)} 
          isUrgent={item.priority === 0}
        />
      ))}
      
      {recommendedActions.length === 0 && (
        <View className="bg-gray-800 p-8 rounded-2xl border border-gray-700 items-center mb-6">
          <Text className="text-gray-500 font-bold">No pending actions for this state.</Text>
        </View>
      )}

      {/* STATS GRID */}
      <View className="flex-row gap-4 mb-6 mt-4">
        <View className="flex-1 bg-gray-800 p-4 rounded-2xl border border-gray-700">
          <Text className="text-gray-500 text-[10px] font-bold uppercase">Registered</Text>
          <Text className="text-white text-2xl font-bold">{stats.registeredVoters}</Text>
        </View>
        <View className="flex-1 bg-gray-800 p-4 rounded-2xl border border-gray-700">
          <Text className="text-gray-500 text-[10px] font-bold uppercase">Votes Cast</Text>
          <Text className="text-white text-2xl font-bold">{stats.votesCast}</Text>
        </View>
      </View>

      {/* ERROR DISPLAY */}
      {error && (
        <View className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl mb-6">
          <Text className="text-red-400 text-sm font-semibold">{error}</Text>
        </View>
      )}

      {/* NAVIGATION PREVIEWS */}
      <View className="mt-6 border-t border-gray-800 pt-8">
        <Text className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-widest">Election Services</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-emerald-600/20 border border-emerald-500/30 p-4 rounded-2xl items-center"
            onPress={() => navigation.navigate("Registration")}
          >
            <Text className="text-emerald-400 font-bold text-xs">Voter Reg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-emerald-600/20 border border-emerald-500/30 p-4 rounded-2xl items-center"
            onPress={() => navigation.navigate("Voting")}
          >
            <Text className="text-emerald-400 font-bold text-xs">Vote Room</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl items-center mt-4"
          onPress={() => navigation.navigate("Polling")}
        >
          <Text className="text-indigo-400 font-bold text-xs">Optimized Polling Stations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-orange-600/20 border border-orange-500/30 p-4 rounded-2xl items-center mt-4"
          onPress={() => navigation.navigate("Education")}
        >
          <Text className="text-orange-400 font-bold text-xs">Election Education Assistant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-2xl items-center mt-4"
          onPress={() => navigation.navigate("Analytics")}
        >
          <Text className="text-purple-400 font-bold text-xs">Live Analytics Engine</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
