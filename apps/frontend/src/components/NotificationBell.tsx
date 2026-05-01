import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Props {
  onPress: () => void;
}

export default function NotificationBell({ onPress }: Props) {
  const { list } = useSelector((state: RootState) => state.notifications);
  const unreadCount = list.length;

  return (
    <TouchableOpacity onPress={onPress} className="relative p-2">
      <View className="bg-gray-800 rounded-full p-2 border border-gray-700">
        {/* Bell Icon Placeholder (using text/symbol for simplicity) */}
        <Text className="text-white text-xl">🔔</Text>
      </View>
      
      {unreadCount > 0 && (
        <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 items-center justify-center border-2 border-gray-900">
          <Text className="text-white text-[10px] font-black">{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
