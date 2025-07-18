import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StundenScreen from './StundenScreen';
import SavedReportsScreen from './SavedReportsScreen';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

// Configurare logging detaliat
if (__DEV__) {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog(...args);
    // Salvăm log-urile într-un fișier sau le trimitem la un serviciu
  };
}

console.log('App starting...');

// Dezactivăm avertismentele care nu sunt critice
LogBox.ignoreLogs(['Warning: ...']);

// Menținem splash screen-ul vizibil
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.log('Error preventing splash screen auto hide:', error);
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.log('Error caught in getDerivedStateFromError:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught in componentDidCatch:', error);
    console.log('Error Info:', errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Oops! Something went wrong.</Text>
          <Text style={{ fontSize: 14, color: 'red', marginBottom: 10 }}>
            {this.state.error && this.state.error.toString()}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{ padding: 10, backgroundColor: '#2563eb', borderRadius: 5 }}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function AnimatedCard({ children, index, ...props }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 80 * index,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [fadeAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        {...props}
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function HomeScreen({ navigation }) {
  const buttons = [
    {
      label: 'Stunden',
      icon: <Feather name="clock" size={24} color="#3b82f6" />, 
      onPress: () => navigation.navigate('Stunden'),
      description: 'Arbeitsstunden erfassen',
    },
    {
      label: 'Meine Einträge',
      icon: <MaterialCommunityIcons name="file-document-outline" size={24} color="#6b7280" />, 
      onPress: () => navigation.navigate('Meine Einträge'),
      description: 'Gespeicherte Berichte anzeigen',
    },
    {
      label: 'Material',
      icon: <MaterialCommunityIcons name="archive-outline" size={24} color="#6b7280" />, 
      onPress: () => alert('Navigieren zur Seite: Material'),
      description: 'Materialien verwalten',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Feather name="briefcase" size={20} color="#ffffff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Partner</Text>
            <Text style={styles.headerSubtitle}>Wählen Sie eine Option, um fortzufahren</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {buttons.map((btn, idx) => (
            <AnimatedCard key={btn.label} index={idx} onPress={btn.onPress} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardIcon}>{btn.icon}</View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{btn.label}</Text>
                  <Text style={styles.cardDescription}>{btn.description}</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </View>
              </View>
            </AnimatedCard>
          ))}
        </View>
      </ScrollView>

      {/* Bottom bar fixat cu iconițe și versiune */}
      <View style={styles.bottomBarFixed}>
        <View style={styles.bottomBarRow}>
          <View style={styles.bottomBarIcons}>
            <TouchableOpacity style={styles.bottomBarButton} onPress={() => alert('Navigieren zur Seite: Einstellungen')}>
              <Feather name="settings" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBarButton} onPress={() => alert('Navigieren zur Seite: Profil')}>
              <FontAwesome5 name="user-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  console.log('Rendering App component...');

  useEffect(() => {
    async function prepare() {
      try {
        console.log('Preparing app resources...');
        // Simulăm încărcarea
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Resources loaded successfully');
      } catch (e) {
        console.error('Error preparing app:', e);
      } finally {
        try {
          console.log('Hiding splash screen...');
          await SplashScreen.hideAsync();
          console.log('Splash screen hidden successfully');
        } catch (e) {
          console.error('Error hiding splash screen:', e);
        }
      }
    }

    prepare();
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer
        onStateChange={(state) => console.log('Navigation state changed:', state)}
        onError={(error) => console.error('Navigation error:', error)}
      >
        <Stack.Navigator 
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1e293b',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen 
            name="Startseite" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Stunden" 
            component={StundenScreen}
            options={{ 
              headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    backgroundColor: '#2563eb',
                    borderRadius: 8,
                    padding: 6,
                    marginRight: 8,
                  }}>
                    <Feather name="clock" size={20} color="#fff" />
                  </View>
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>Arbeitszeiterfassung</Text>
                </View>
              ),
              headerStyle: {
                backgroundColor: '#1e293b',
              },
              headerTintColor: '#ffffff',
            }}
          />
          <Stack.Screen 
            name="Meine Einträge" 
            component={SavedReportsScreen}
            options={{ 
              headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    backgroundColor: '#2563eb',
                    borderRadius: 8,
                    padding: 6,
                    marginRight: 8,
                  }}>
                    <MaterialCommunityIcons name="file-document-outline" size={20} color="#fff" />
                  </View>
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>Meine Einträge</Text>
                </View>
              ),
              headerStyle: {
                backgroundColor: '#1e293b',
              },
              headerTintColor: '#ffffff',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

export default function AppWrapper() {
  console.log('Rendering AppWrapper...');
  return (
    <View style={{ flex: 1 }} onLayout={() => console.log('AppWrapper layout complete')}>
      <App />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#1e293b',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTextContainer: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarFixed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomBarIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  bottomBarButton: {
    padding: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});