import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../firebase';
import { setAuthenticated, setUnauthenticated } from '../store/authSlice';
import { RootState, AppDispatch } from '../store';

import Dashboard from '../screens/Dashboard';
import RegistrationScreen from '../screens/RegistrationScreen';
import VotingScreen from '../screens/VotingScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import PollingScreen from '../screens/PollingScreen';
import EducationScreen from '../screens/EducationScreen';
import AuthScreen from '../screens/AuthScreen';

export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
  Registration: undefined;
  Voting: undefined;
  Analytics: undefined;
  Polling: undefined;
  Education: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setAuthenticated(user.uid));
      } else {
        dispatch(setUnauthenticated());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    // We could render a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#111827' }, // gray-900
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }} 
          />
        ) : (
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={Dashboard} 
              options={{ title: 'Votexa Control Room' }} 
            />
            <Stack.Screen 
              name="Registration" 
              component={RegistrationScreen} 
              options={{ title: 'Voter Registration' }} 
            />
            <Stack.Screen 
              name="Voting" 
              component={VotingScreen} 
              options={{ title: 'Official Ballot' }} 
            />
            <Stack.Screen 
              name="Analytics" 
              component={AnalyticsScreen} 
              options={{ title: 'Live Analytics' }} 
            />
            <Stack.Screen 
              name="Polling" 
              component={PollingScreen} 
              options={{ title: 'Polling Stations' }} 
            />
            <Stack.Screen 
              name="Education" 
              component={EducationScreen} 
              options={{ title: 'Election Assistant' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
