import React from 'react';
import { StatusBar } from 'react-native';
import { SessionProvider } from './src/features/auth/session';
import { SessionGate } from './src/features/auth/SessionGate';
import { Icon } from './src/shared/Icon';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CatalogProvider } from './src/app/catalog';
import { ProductsScreen } from './src/features/products/ProductsScreen';
import { BenefitsScreen } from './src/features/benefits/BenefitsScreen';
import { colors, typography } from './src/shared/theme';

const Tabs = createBottomTabNavigator();
const productsOptions = {
  title: 'Mis productos',
  tabBarIcon: ({ color }: { color: string }) => (
    <Icon name="wallet" color={color} size={23} />
  ),
};
const benefitsOptions = {
  tabBarIcon: ({ color }: { color: string }) => (
    <Icon name="tag" color={color} size={23} />
  ),
};
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar barStyle="light-content" />
        <SessionGate>
          <CatalogProvider>
            <NavigationContainer theme={theme}>
              <Tabs.Navigator
                screenOptions={{
                  headerShown: false,
                  tabBarActiveTintColor: colors.primary,
                  tabBarInactiveTintColor: colors.muted,
                  tabBarLabelStyle: {
                    fontFamily: typography.family,
                    fontSize: 12,
                    fontWeight: '700',
                  },
                  tabBarStyle: {
                    paddingTop: 10,
                    minHeight: 76,
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: '#742284',
                    shadowOpacity: 0.04,
                    shadowRadius: 16,
                  },
                  freezeOnBlur: false,
                }}
              >
                <Tabs.Screen
                  name="Productos"
                  component={ProductsScreen}
                  options={productsOptions}
                />
                <Tabs.Screen
                  name="Beneficios"
                  component={BenefitsScreen}
                  options={benefitsOptions}
                />
              </Tabs.Navigator>
            </NavigationContainer>
          </CatalogProvider>
        </SessionGate>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
