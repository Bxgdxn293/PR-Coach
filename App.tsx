import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fonts } from './src/theme';
import { useFonts, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { DataProvider } from './src/context/DataContext';
import { PremiumProvider } from './src/context/PremiumContext';
import { CreditsProvider, useCredits } from './src/context/CreditsContext';
import { ProfileProvider, useProfile } from './src/context/ProfileContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { WorkoutScreen } from './src/screens/WorkoutScreen';
import { PRsScreen } from './src/screens/PRsScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { TemplatesScreen } from './src/screens/TemplatesScreen';
import { TemplateEditScreen } from './src/screens/TemplateEditScreen';
import { PrGoalScreen } from './src/screens/PrGoalScreen';
import { PrGoalEditScreen } from './src/screens/PrGoalEditScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { CoachScreen } from './src/screens/CoachScreen';
import { FormCheckScreen } from './src/screens/FormCheckScreen';
import { FormResultScreen } from './src/screens/FormResultScreen';
import { CreditsScreen } from './src/screens/CreditsScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { FriendProfileScreen } from './src/screens/FriendProfileScreen';
import { AddFriendScreen } from './src/screens/AddFriendScreen';
import { BlockedScreen } from './src/screens/BlockedScreen';
import { ThemesScreen } from './src/screens/ThemesScreen';
import { ThemeProvider, useColors } from './src/context/ThemeContext';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Loading() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

function ConnectionError({ onRetry }: { onRetry: () => void }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 24, textAlign: 'center' }}>No connection</Text>
      <Text style={{ color: colors.muted, fontFamily: fonts.medium, fontSize: 16, textAlign: 'center' }}>
        We could not load your account. Check your internet and try again.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={{ height: 56, paddingHorizontal: 32, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: colors.onAccent, fontFamily: fonts.bold, fontSize: 18 }}>Retry</Text>
      </Pressable>
    </View>
  );
}

function Root() {
  const colors = useColors();
  const navTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, primary: colors.accent },
    }),
    [colors],
  );
  const { user, loading } = useAuth();
  const { profile, loaded } = useProfile();
  const credits = useCredits();
  if (loading || (user && (!loaded || !credits.settled))) return <Loading />;
  if (!user) return <LoginScreen />;
  // The username is mandatory. Without one (and without a cached one) we cannot tell: ask to retry.
  if (!credits.username && !credits.hasData) return <ConnectionError onRetry={() => credits.refresh()} />;
  const needsUsername = !credits.username;
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator initialRouteName={profile && !needsUsername ? 'Menu' : 'Onboarding'} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Workout" component={WorkoutScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="PRs" component={PRsScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Templates" component={TemplatesScreen} />
        <Stack.Screen name="TemplateEdit" component={TemplateEditScreen} />
        <Stack.Screen name="PrGoal" component={PrGoalScreen} />
        <Stack.Screen name="PrGoalEdit" component={PrGoalEditScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} initialParams={{ usernameOnly: !!profile && needsUsername }} />
        <Stack.Screen name="Coach" component={CoachScreen} />
        <Stack.Screen name="FormCheck" component={FormCheckScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="FormResult" component={FormResultScreen} />
        <Stack.Screen name="Credits" component={CreditsScreen} />
        <Stack.Screen name="Friends" component={FriendsScreen} />
        <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
        <Stack.Screen name="AddFriend" component={AddFriendScreen} />
        <Stack.Screen name="Blocked" component={BlockedScreen} />
        <Stack.Screen name="Themes" component={ThemesScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function ThemedApp() {
  const [fontsLoaded, fontError] = useFonts({ SpaceGrotesk_500Medium, SpaceGrotesk_700Bold });
  // A failed font download must not leave the app on the loading screen forever.
  if (!fontsLoaded && !fontError) return <Loading />;
  return (
    <SafeAreaProvider>
      <ThemedStatusBar />
      <AuthProvider>
        <SettingsProvider>
          <PremiumProvider>
            <ProfileProvider>
              <CreditsProvider>
                <DataProvider>
                  <Root />
                </DataProvider>
              </CreditsProvider>
            </ProfileProvider>
          </PremiumProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const colors = useColors();
  const n = parseInt(colors.bg.slice(1), 16);
  const brightness = (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
  return <StatusBar style={brightness < 128 ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
