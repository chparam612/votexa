import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PollingStation } from '@votexa/algorithms';

interface Props {
  station: PollingStation;
  onPress?: () => void;
  isRecommended?: boolean;
}

export default function StationCard({ station, onPress, isRecommended }: Props) {
  const getWaitColor = (wait: number) => {
    if (wait < 10) return 'text-emerald-400';
    if (wait < 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`bg-gray-800 p-5 rounded-2xl border mb-4 shadow-sm ${isRecommended ? 'border-indigo-500' : 'border-gray-700'}`}
    >
      {isRecommended && (
        <View className="bg-indigo-600 px-2 py-1 rounded-full self-start mb-2">
          <Text className="text-[10px] text-white font-black uppercase">Recommended</Text>
        </View>
      )}
      
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{station.name}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-500 text-xs font-semibold mr-2">{station.availableStaff} Staff Members</Text>
            <View className="w-1 h-1 bg-gray-600 rounded-full mr-2" />
            <Text className="text-gray-500 text-xs font-semibold">{station.activeVoters} Active Voters</Text>
          </View>
        </View>
        
        <View className="items-end">
          <Text className={`text-2xl font-black ${getWaitColor(station.currentWaitTimeMinutes)}`}>
            {station.currentWaitTimeMinutes}
          </Text>
          <Text className="text-[10px] text-gray-500 font-bold uppercase">Min Wait</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
