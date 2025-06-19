import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SavedReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showActionsDialog, setShowActionsDialog] = useState(false);

  // Funcție pentru calculul orelor
  const calculateHours = (startTime, endTime, breaks) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    // Scade pauzele
    if (breaks.break9am) totalMinutes -= 15;
    if (breaks.lunchBreak) totalMinutes -= 60;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadReports);
    loadReports();
    return unsubscribe;
  }, [navigation]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const reportKeys = keys.filter(key => key.startsWith('report-'));
      const stores = await AsyncStorage.multiGet(reportKeys);
      const reports = stores
        .map(([key, value]) => ({ key, ...(value ? JSON.parse(value) : {}) }))
        .filter(report => report.date && report.location)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Grupează rapoartele după dată
      const groupedReports = reports.reduce((groups, report) => {
        const date = report.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(report);
        return groups;
      }, {});

      // Sortează rapoartele din fiecare zi după ora de început
      Object.keys(groupedReports).forEach(date => {
        groupedReports[date].sort((a, b) => {
          const timeA = a.startTime.replace(':', '');
          const timeB = b.startTime.replace(':', '');
          return timeA - timeB;
        });
      });

      setReports(groupedReports);
    } catch (error) {
      console.error('Eroare la încărcarea rapoartelor:', error);
      setReports({});
    } finally {
      setLoading(false);
    }
  };

  const handleActions = (report) => {
    setSelectedReport(report);
    setShowActionsDialog(true);
  };

  const deleteReport = async () => {
    if (!selectedReport) return;
    
    try {
      await AsyncStorage.removeItem(selectedReport.key);
      loadReports();
      setShowActionsDialog(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Eroare la ștergere:', error);
      Alert.alert('Fehler', 'Fehler beim Löschen des Eintrags');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return `${days[date.getDay()]}, ${date.toLocaleDateString('de-DE')}`;
  };

  // Calculează totalul orelor pentru o zi
  const calculateDayTotal = (dayReports) => {
    let totalMinutes = 0;
    dayReports.forEach(report => {
      const [startHour, startMin] = report.startTime.split(':').map(Number);
      const [endHour, endMin] = report.endTime.split(':').map(Number);
      let minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      if (report.break9am) minutes -= 15;
      if (report.lunchBreak) minutes -= 60;
      totalMinutes += minutes;
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
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
        {loading ? (
          <Text style={styles.messageText}>Laden...</Text>
        ) : Object.keys(reports).length === 0 ? (
          <Text style={styles.messageText}>Keine Einträge gefunden.</Text>
        ) : (
          Object.entries(reports).map(([date, dayReports]) => (
            <View key={date} style={styles.dayCard}>
              {/* Header zi */}
              <View style={styles.dayHeader}>
                <View style={styles.dayHeaderLeft}>
                  <Feather name="calendar" size={16} color="#3b82f6" />
                  <Text style={styles.dayHeaderText}>{formatDate(date)}</Text>
                </View>
                <View style={styles.dayHeaderRight}>
                  <Text style={styles.dayTotal}>
                    Gesamt: {calculateDayTotal(dayReports)}
                  </Text>
                </View>
              </View>

              {/* Tabel cu rapoarte */}
              <View style={styles.tableContainer}>
                {/* Header tabel */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Arbeitsort</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Zeit</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Std.</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 0.3 }]}></Text>
                </View>

                {/* Rânduri tabel */}
                {dayReports.map((report, idx) => (
                  <View key={report.key} style={[
                    styles.tableRow,
                    idx === dayReports.length - 1 ? null : styles.tableRowBorder
                  ]}>
                    <View style={[styles.tableCell, { flex: 1.5 }]}>
                      <Feather name="map-pin" size={14} color="#6b7280" style={styles.cellIcon} />
                      <Text style={styles.locationText}>{report.location}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text style={styles.timeText}>
                        {report.startTime} - {report.endTime}
                        {(report.break9am || report.lunchBreak) && (
                          <Text style={styles.breakIndicator}> •</Text>
                        )}
                      </Text>
                    </View>
                    <Text style={[styles.tableCell, styles.hoursText, { flex: 0.8 }]}>
                      {calculateHours(report.startTime, report.endTime, {
                        break9am: report.break9am,
                        lunchBreak: report.lunchBreak
                      })}
                    </Text>
                    <TouchableOpacity
                      style={[styles.tableCell, { flex: 0.3 }]}
                      onPress={() => handleActions(report)}
                    >
                      <Feather name="more-vertical" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Footer cu legende pentru pauze */}
              {dayReports.some(r => r.break9am || r.lunchBreak) && (
                <View style={styles.legendContainer}>
                  <Feather name="coffee" size={12} color="#6b7280" />
                  <Text style={styles.legendText}>• = Pause</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Dialog acțiuni */}
      <Modal
        visible={showActionsDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionsDialog(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowActionsDialog(false)}
        >
          <View style={styles.actionsDialog}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setShowActionsDialog(false);
                navigation.navigate('Stunden', {
                  editKey: selectedReport?.key,
                  editData: selectedReport
                });
              }}
            >
              <Feather name="edit" size={20} color="#3b82f6" />
              <Text style={styles.actionText}>Bearbeiten</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                Alert.alert(
                  'Löschen',
                  'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?',
                  [
                    { text: 'Abbrechen', style: 'cancel' },
                    { 
                      text: 'Löschen',
                      style: 'destructive',
                      onPress: deleteReport
                    }
                  ]
                );
              }}
            >
              <Feather name="trash-2" size={20} color="#ef4444" />
              <Text style={[styles.actionText, styles.deleteText]}>Löschen</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
    paddingTop: 16,
    paddingBottom: 16,
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
    padding: 16,
    paddingBottom: 32,
  },
  messageText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6b7280',
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dayHeaderRight: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  dayTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  tableContainer: {
    paddingHorizontal: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  tableHeaderCell: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  breakIndicator: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'right',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsDialog: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  deleteButton: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  deleteText: {
    color: '#ef4444',
  },
}); 