import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface Props {
  score: number;
  level: string;
}

export default function RiskGauge({ score, level }: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: score,
      friction: 8,
      tension: 40,
      useNativeDriver: false, // Cannot use native driver for width
    }).start();
  }, [score]);

  const width = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const getLevelColor = () => {
    if (level === 'HIGH') return 'bg-red-500';
    if (level === 'MEDIUM') return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getTextColor = () => {
    if (level === 'HIGH') return 'text-red-400';
    if (level === 'MEDIUM') return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <View className="w-full bg-gray-800 p-6 rounded-2xl border border-gray-700 my-4 shadow-xl">
      <View className="flex-row justify-between items-end mb-4">
        <View>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Risk Engine</Text>
          <Text className={`text-3xl font-black ${getTextColor()}`}>{level}</Text>
        </View>
        <Text className="text-white text-4xl font-light">{Math.round(score)}<Text className="text-lg text-gray-500">/100</Text></Text>
      </View>

      {/* Track */}
      <View className="h-3 w-full bg-gray-900 rounded-full overflow-hidden">
        {/* Fill */}
        <Animated.View 
          className={`h-full rounded-full ${getLevelColor()}`} 
          style={{ width }} 
        />
      </View>
      
      <View className="flex-row justify-between mt-2">
        <Text className="text-[10px] text-gray-600 font-bold">LOW</Text>
        <Text className="text-[10px] text-gray-600 font-bold">CRITICAL</Text>
      </View>
    </View>
  );
}
