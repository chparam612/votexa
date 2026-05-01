import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchRecommendedStation } from '../store/pollingSlice';
import StationCard from '../components/StationCard';

export default function PollingScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { recommendedStation, allStations, isLoading, error } = useSelector(
    (state: RootState) => state.polling,
  );

  useEffect(() => {
    dispatch(fetchRecommendedStation());
  }, []);

  const onRefresh = () => {
    dispatch(fetchRecommendedStation());
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-900 px-6 pt-6"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      <View className="mb-6">
        <Text className="text-3xl font-black text-white">Polling Stations</Text>
        <Text className="text-gray-400 font-semibold mt-1">Real-time wait time optimization</Text>
      </View>

      {error && (
        <View className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl mb-6">
          <Text className="text-red-400 text-sm font-semibold">{error}</Text>
        </View>
      )}

      {recommendedStation && (
        <>
          <Text className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-widest">Recommended for You</Text>
          <StationCard 
            station={recommendedStation} 
            isRecommended={true} 
            onPress={() => console.log('Selected', recommendedStation.id)}
          />
        </>
      )}

      <Text className="text-gray-500 font-bold mb-4 mt-4 uppercase text-xs tracking-widest">All Nearby Stations</Text>
      {allStations
        .filter(s => s.id !== recommendedStation?.id)
        .map((station) => (
          <StationCard 
            key={station.id} 
            station={station} 
            onPress={() => console.log('Selected', station.id)}
          />
        ))}

      {allStations.length === 0 && !isLoading && (
        <View className="items-center py-20">
          <Text className="text-gray-600 font-bold">No stations found nearby.</Text>
        </View>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
