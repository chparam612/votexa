import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ActionItem } from '@votexa/algorithms';

interface Props {
  item: ActionItem;
  onPress: () => void;
  isUrgent?: boolean;
}

export default function ActionCard({ item, onPress, isUrgent }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`bg-gray-800 p-4 rounded-2xl border mb-3 flex-row items-center justify-between shadow-sm
        ${isUrgent ? 'border-red-500/50 bg-red-900/10' : 'border-gray-700'}`}
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          {isUrgent && (
            <View className="bg-red-500 rounded-full w-2 h-2 mr-2" />
          )}
          <Text className={`text-[10px] font-black uppercase tracking-widest ${isUrgent ? 'text-red-400' : 'text-gray-500'}`}>
            {isUrgent ? 'Urgent Action Required' : 'Recommended Step'}
          </Text>
        </View>
        <Text className="text-white font-bold text-base">{item.label}</Text>
      </View>
      
      <View className={`rounded-xl px-4 py-2 ${isUrgent ? 'bg-red-600' : 'bg-indigo-600'}`}>
        <Text className="text-white font-black text-xs uppercase">Start</Text>
      </View>
    </TouchableOpacity>
  );
}
