import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SavedReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadReports);
    loadReports();
    return unsubscribe;
  }, [navigation]);

  const loadReports = async () => {
    setLoading(true);
    const keys = await AsyncStorage.getAllKeys();
    const reportKeys = keys.filter(key => key.startsWith('report-'));
    const stores = await AsyncStorage.multiGet(reportKeys);
    setReports(stores.map(([key, value]) => ({ key, ...(value ? JSON.parse(value) : {}) })));
    setLoading(false);
  };

  const deleteReport = (key) => {
    Alert.alert('Löschen', 'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem(key);
        loadReports();
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Meine Einträge</Text>
            <Text style={styles.headerSubtitle}>Alle lokal gespeicherten Berichte</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardsContainer}>
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Laden...</Text>
          ) : reports.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Keine Einträge gefunden.</Text>
          ) : reports.map((item, idx) => (
            <View key={item.key} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardIcon}><Feather name="calendar" size={24} color="#3b82f6" /></View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{item.date || item.key}</Text>
                  <Text style={styles.cardDescription}>{item.location || ''}</Text>
                  <Text style={styles.cardDescription}>{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : ''}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => navigation.navigate('Stunden', { editKey: item.key, editData: item })}>
                    <Feather name="edit" size={20} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteReport(item.key)} style={{ marginLeft: 16 }}>
                    <Feather name="trash-2" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 