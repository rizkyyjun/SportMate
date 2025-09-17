import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Field } from '../types';
import { bookingService } from '../services/booking.service';
import { formatCurrency } from '../utils';

type BookingConfirmationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'BookingConfirmation'>;
  route: { params: { field: Field; date: string; startTime: string; endTime: string } };
};

const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  navigation,
  route,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { field, date, startTime, endTime } = route.params;
  const serviceFee = 0;
  const totalPrice = field.price + serviceFee;

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bookingService.createBooking({
        fieldId: field.id,
        date,
        startTime,
        endTime,
      });

      if (result.success) {
        // On success, navigate to My Bookings screen
        navigation.navigate('MyBookings');
      } else {
        setError(result.message || 'Failed to confirm booking. Please try again.');
      }
    } catch (error: any) {
      setError('Failed to confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Booking Summary</Text>

        <View style={styles.fieldInfo}>
          <Text style={styles.fieldName}>{field.name}</Text>
          <Text style={styles.fieldSport}>{field.sport}</Text>
          <Text style={styles.fieldLocation}>{field.location}</Text>
        </View>

        <View style={styles.bookingDetails}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{startTime} - {endTime}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>1 hour</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>{formatCurrency(field.price, 'IDR')}</Text>
          </View>
        </View>

        <View style={styles.paymentSummary}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal:</Text>
            <Text style={styles.detailValue}>{formatCurrency(field.price, 'IDR')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Fee:</Text>
            <Text style={styles.detailValue}>{formatCurrency(serviceFee, 'IDR')}</Text>
          </View>
          
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={[styles.detailLabel, styles.totalLabel]}>Total:</Text>
            <Text style={[styles.detailValue, styles.totalValue]}>{formatCurrency(totalPrice, 'IDR')}</Text>
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.disabledButton]}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  fieldName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fieldSport: {
    fontSize: 16,
    color: '#0066cc',
    marginBottom: 5,
  },
  fieldLocation: {
    fontSize: 14,
    color: '#666',
  },
  bookingDetails: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  paymentSummary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009900',
  },
  confirmButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default BookingConfirmationScreen;
