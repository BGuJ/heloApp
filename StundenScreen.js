import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Modal, Pressable, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';

export default function StundenScreen() {
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    startTime: '',
    endTime: '',
    break9am: false,
    lunchBreak: false
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const locations = [
    'Zentrales Büro Bukarest',
    'Filiale Pipera',
    'Lager Chitila',
    'Filiale Baneasa',
    'Büro Iași',
    'Homeoffice'
  ];

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };
  const timeOptions = generateTimeOptions();

  const calculateWorkingHours = () => {
    if (!formData.startTime || !formData.endTime) return '0:00';
    const [startHour, startMin] = formData.startTime.split(':').map(Number);
    const [endHour, endMin] = formData.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    let totalMinutes = endMinutes - startMinutes;
    if (formData.break9am) totalMinutes -= 15;
    if (formData.lunchBreak) totalMinutes -= 60;
    if (totalMinutes < 0) return '0:00';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.location || !formData.startTime || !formData.endTime) {
      alert('Bitte füllen Sie alle Pflichtfelder aus!');
      return;
    }
    alert('Arbeitsstunden wurden erfolgreich erfasst!');
  };

  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }} contentContainerStyle={{ paddingVertical: 16 }}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconBox}>
            <Feather name="clock" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Arbeitszeiterfassung</Text>
            <Text style={styles.headerSubtitle}>Bitte geben Sie die Daten für den Arbeitstag ein</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Data lucrată */}
          <Text style={styles.label}><Feather name="calendar" size={16} />  Arbeitstag</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: formData.date ? '#222' : '#888' }}>
              {formData.date ? formData.date : 'tt.mm.jjjj'}
            </Text>
            <Feather name="calendar" size={18} color="#888" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.date ? new Date(formData.date) : today}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={today}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFormData({ ...formData, date: selectedDate.toISOString().split('T')[0] });
                }
              }}
            />
          )}

          {/* Locația de lucru */}
          <Text style={styles.label}><Feather name="map-pin" size={16} />  Arbeitsort</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowLocationDropdown(true)}
          >
            <Text style={{ color: formData.location ? '#222' : '#888' }}>
              {formData.location || 'Arbeitsort wählen'}
            </Text>
            <Feather name="chevron-down" size={18} color="#888" />
          </TouchableOpacity>
          <Modal
            visible={showLocationDropdown}
            transparent
            animationType="fade"
            onRequestClose={() => setShowLocationDropdown(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setShowLocationDropdown(false)}>
              <View style={styles.dropdown}>
                {locations.map((location, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({ ...formData, location });
                      setShowLocationDropdown(false);
                    }}
                  >
                    <Text>{location}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>

          {/* Intervalul de timp */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Beginn</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={{ color: formData.startTime ? '#222' : '#888' }}>
                  {formData.startTime || '--:--'}
                </Text>
                <Feather name="clock" size={18} color="#888" />
              </TouchableOpacity>
              {showStartPicker && (
                <Modal
                  transparent
                  visible={showStartPicker}
                  animationType="fade"
                  onRequestClose={() => setShowStartPicker(false)}
                >
                  <Pressable style={styles.modalOverlay} onPress={() => setShowStartPicker(false)}>
                    <View style={styles.dropdown}>
                      <ScrollView style={{ maxHeight: 200 }}>
                        {timeOptions.map((time, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFormData({ ...formData, startTime: time });
                              setShowStartPicker(false);
                            }}
                          >
                            <Text>{time}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ende</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={{ color: formData.endTime ? '#222' : '#888' }}>
                  {formData.endTime || '--:--'}
                </Text>
                <Feather name="clock" size={18} color="#888" />
              </TouchableOpacity>
              {showEndPicker && (
                <Modal
                  transparent
                  visible={showEndPicker}
                  animationType="fade"
                  onRequestClose={() => setShowEndPicker(false)}
                >
                  <Pressable style={styles.modalOverlay} onPress={() => setShowEndPicker(false)}>
                    <View style={styles.dropdown}>
                      <ScrollView style={{ maxHeight: 200 }}>
                        {timeOptions.map((time, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFormData({ ...formData, endTime: time });
                              setShowEndPicker(false);
                            }}
                          >
                            <Text>{time}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>
              )}
            </View>
          </View>

          {/* Pauze efectuate */}
          <Text style={{ fontWeight: 'bold', marginTop: 16 }}>Pausen</Text>
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              style={[styles.checkboxRow, formData.break9am && styles.checkboxRowActive]}
              onPress={() => setFormData({ ...formData, break9am: !formData.break9am })}
            >
              <View style={[styles.checkbox, formData.break9am && styles.checkboxChecked]}>
                {formData.break9am && <Feather name="check" size={16} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkboxLabel}>Pause 9:00</Text>
                <Text style={styles.checkboxDesc}>15 Minuten</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkboxRow, formData.lunchBreak && styles.checkboxRowActive]}
              onPress={() => setFormData({ ...formData, lunchBreak: !formData.lunchBreak })}
            >
              <View style={[styles.checkbox, formData.lunchBreak && styles.checkboxChecked]}>
                {formData.lunchBreak && <Feather name="check" size={16} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkboxLabel}>Mittagspause</Text>
                <Text style={styles.checkboxDesc}>12:00 - 13:00 (60 Minuten)</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Calculul orelor */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Gearbeitete Stunden insgesamt:</Text>
            <Text style={styles.totalValue}>{calculateWorkingHours()}</Text>
          </View>

          {/* Buton submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Feather name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>Stunden erfassen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  headerIconBox: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 2,
  },
  body: {
    padding: 18,
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    width: 280,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  checkboxRowActive: {
    borderColor: '#2563eb',
    backgroundColor: '#e0e7ff',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  checkboxDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  totalBox: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },
  totalLabel: {
    color: '#1e40af',
    fontSize: 15,
    fontWeight: '500',
  },
  totalValue: {
    color: '#1e40af',
    fontSize: 22,
    fontWeight: 'bold',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 