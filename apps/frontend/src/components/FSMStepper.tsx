import React from 'react';
import { View, Text } from 'react-native';
import { ElectionState } from '@votexa/algorithms';

const STEPS = [
  ElectionState.SETUP,
  ElectionState.REGISTRATION_OPEN,
  ElectionState.VOTING_OPEN,
  ElectionState.TALLYING,
  ElectionState.CLOSED,
];

interface Props {
  currentState: ElectionState;
}

export default function FSMStepper({ currentState }: Props) {
  const currentIndex = STEPS.indexOf(currentState);

  return (
    <View className="w-full px-4 my-6">
      <View className="flex-row items-center justify-between">
        {STEPS.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isPaused = currentState === ElectionState.VOTING_PAUSED && step === ElectionState.VOTING_OPEN;

          return (
            <React.Fragment key={step}>
              {/* Step Circle */}
              <View className="items-center">
                <View 
                  className={`w-10 h-10 rounded-full items-center justify-center border-2 
                    ${isPaused ? 'bg-yellow-500 border-yellow-600' : 
                      isCurrent ? 'bg-indigo-600 border-indigo-400' : 
                      isActive ? 'bg-emerald-600 border-emerald-400' : 'bg-gray-800 border-gray-700'}`}
                >
                  <Text className="text-white font-bold">{index + 1}</Text>
                </View>
                <Text 
                  className={`text-[10px] mt-2 font-semibold text-center w-16 
                    ${isCurrent ? 'text-indigo-400' : isActive ? 'text-emerald-400' : 'text-gray-500'}`}
                  numberOfLines={2}
                >
                  {step.replace('_', ' ')}
                </Text>
              </View>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <View className={`flex-1 h-[2px] -mt-6 mx-1 ${index < currentIndex ? 'bg-emerald-500' : 'bg-gray-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}
