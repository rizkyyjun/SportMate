import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Booking } from '../types';
import { bookingService } from '../services/booking.service';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

// Define the navigation prop type for this screen
type AdminBookingReviewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AdminBookingReview'
>;

type AdminBookingReviewScreenProps = {
  navigation: AdminBookingReviewScreenNavigationProp;
};

const AdminBookingReviewScreen: React.FC<AdminBookingReviewScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchBookingsForReview();
    } else {
      setLoading(false);
      setError('You do not have permission to view this page.');
    }
  }, [user]); // Re-fetch if user role changes

  const fetchBookingsForReview = async () => {
    try {
      setLoading(true);
      setError(null);
      const allBookings = await bookingService.getAllBookings();
      // Filter for bookings that are pending approval
      const pendingBookings = allBookings.filter(booking => booking.status.toLowerCase() === 'pending');
      setBookings(pendingBookings);
    } catch (err) {
      console.error('Failed to fetch bookings for review:', err);
      setError('Failed to load bookings for review. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      Alert.alert('Success', `Booking ${status === 'confirmed' ? 'approved' : 'rejected'} successfully!`);
      // Refresh the list after updating status
      fetchBookingsForReview();
    } catch (err) {
      console.error(`Failed to ${status} booking ${bookingId}:`, err);
      Alert.alert('Error', `Failed to ${status} booking. Please try again.`);
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.fieldName}>{item.field?.name || item.fieldId || 'Unknown Field'}</Text>
        <Text style={[styles.status, styles.statusPending]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{item.date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{item.startTime} - {item.endTime}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.totalPrice, 'IDR')}</Text>
        </View>
      </View>
      
      <Text style={styles.bookedOn}>
        Booked on: {format(new Date(item.createdAt), 'MMM dd, yyyy')}
      </Text>

      {/* Admin Action Buttons */}
      <View style={styles.adminActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleUpdateBookingStatus(item.id, 'confirmed')}
        >
          <Text style={styles.actionButtonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleUpdateBookingStatus(item.id, 'rejected')}
        >
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {user?.isAdmin && ( // Only show retry if user is admin and error is likely fetch-related
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookingsForReview}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Review</Text>
        <Text style={styles.subtitle}>{bookings.length} pending booking{bookings.length !== 1 ? 's' : ''}</Text>
      </View>
      
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending bookings to review.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            // This is a workaround to keep the header within the FlatList context if needed,
            // but the primary fix is removing the outer ScrollView.
            // The header is already rendered above the FlatList in the original code.
            // We will keep the header outside the FlatList and ensure the FlatList takes up remaining space.
            null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Use flex: 1 to allow FlatList to take available space
    backgroundColor: '#f5f5f5',
    // paddingBottom: 20, // Removed as FlatList contentContainerStyle handles padding
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    // marginBottom: 10, // Removed as FlatList contentContainerStyle will handle spacing
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20, // Add padding at the bottom for scrollable content
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  // Note: statusConfirmed and statusCancelled are not used here as we only display pending bookings
  bookingDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  bookedOn: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 10,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#28a745', // Green
  },
  rejectButton: {
    backgroundColor: '#dc3545', // Red
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1, // Make empty container take up available space
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default AdminBookingReviewScreen;
