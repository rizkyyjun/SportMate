import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Field, TimeSlot, FieldAvailability, Booking } from '../types';
import { fieldService } from '../services/field.service';
import { format } from 'date-fns';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { formatCurrency } from '../utils';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

type FieldDetailsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'FieldDetails'>;
  route: { params: { fieldId: string } };
};

/* --- Force English locale --- */
LocaleConfig.locales['en'] = {
  monthNames: [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ],
  monthNamesShort: [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
  ],
  dayNames: [
    'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
  ],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
};
LocaleConfig.defaultLocale = 'en';

const FieldDetailsScreen: React.FC<FieldDetailsScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth(); // Get authenticated user from context
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]); // State for user's bookings

  useEffect(() => {
    const fetchFieldDetailsAndUserBookings = async () => {
      try {
        setLoading(true);
        const fetchedField = await fieldService.getFieldById(route.params.fieldId);
        if (!fetchedField) {
          setError('Failed to load field details. Please try again later.');
          setLoading(false);
          return;
        }
        setField(fetchedField);

        if (fetchedField.availability && fetchedField.availability.length > 0) {
          const dates = fetchedField.availability.map((a: FieldAvailability) => a.date);
          setAvailableDates(dates);
          const today = format(new Date(), 'yyyy-MM-dd');
          if (dates.includes(today)) {
            setSelectedDate(today);
          } else {
            setSelectedDate(dates[0]);
          }
        } else {
          setAvailableDates([]);
          setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
        }

        // Fetch user's bookings for this field
        if (user) {
          const fetchedUserBookings = await fieldService.getFieldBookingsForUser(route.params.fieldId);
          setUserBookings(fetchedUserBookings);
        }

      } catch (err) {
        console.error('Failed to fetch field details or user bookings:', err);
        setError('Failed to load field details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFieldDetailsAndUserBookings();
  }, [route.params.fieldId, user]); // Re-fetch if user changes

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    // Disable all dates first, then enable available ones
    availableDates.forEach(d => {
      marks[d] = { marked: true, dotColor: '#0066cc' };
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: '#0066cc',
      };
    }
    return marks;
  }, [availableDates, selectedDate]);

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    if (!field) {
      setError('Field information not available');
      return;
    }

    // Check if the user has already booked this specific timeslot
    const isAlreadyBookedByUser = userBookings.some(
      (booking) =>
        booking.date === selectedDate &&
        booking.startTime === selectedSlot.startTime &&
        booking.endTime === selectedSlot.endTime
    );

    if (isAlreadyBookedByUser) {
      Alert.alert(
        'Already Booked',
        'You have already booked this field in this time slot. Please select another one.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Refresh field data to ensure latest availability
      const refreshedField = await fieldService.getFieldById(field.id);
      if (!refreshedField) {
        setError('Failed to verify availability. Please try again.');
        return;
      }
      setField(refreshedField);

      // Check if the slot is still available (globally)
      const currentAvailability = refreshedField.availability?.find((a: FieldAvailability) => a.date === selectedDate);
      const isSlotStillAvailable = currentAvailability?.slots?.find((slot: TimeSlot) =>
        slot.id === selectedSlot.id && !slot.isBooked
      );

      if (!isSlotStillAvailable) {
        setError('This time slot is no longer available. Please select another slot.');
        return;
      }

      setError(null);
      navigation.navigate('BookingConfirmation', {
        field: refreshedField,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });
    } catch (error) {
      console.error('Failed to refresh field data:', error);
      setError('Failed to verify availability. Please try again.');
    }
  };

  if (loading || !field) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // Determine if a slot is booked by the current user
  const isSlotBookedByCurrentUser = (slot: TimeSlot) => {
    return userBookings.some(
      (booking) =>
        booking.date === selectedDate &&
        booking.startTime === slot.startTime &&
        booking.endTime === slot.endTime
    );
  };

  const isUserAdmin = user?.isAdmin;

  return (
    <ScrollView style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.imageContainer}
      >
        {field.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.content}>
        <Text style={styles.name}>{field.name}</Text>
        <Text style={styles.sport}>{field.sport}</Text>
        <Text style={styles.location}>{field.location}</Text>
        <Text style={styles.price}>{formatCurrency(field.price, 'IDR')}/hour</Text>
        {(field.contactPhone || field.contactEmail) && (
          <>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {field.contactPhone && (
              <Text style={styles.contactInfo}>Phone: {field.contactPhone}</Text>
            )}
            {field.contactEmail && (
              <Text style={styles.contactInfo}>Email: {field.contactEmail}</Text>
            )}
          </>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{field.description}</Text>

        <Text style={styles.sectionTitle}>Select Date</Text>

        <Calendar
          current={selectedDate}
          minDate={format(new Date(), 'yyyy-MM-dd')}
          onDayPress={(day) => {
            if (availableDates.includes(day.dateString)) {
              setSelectedDate(day.dateString);
              setSelectedSlot(null);
              setError(null);
            } else {
              setError('No availability on selected date');
            }
          }}
          markedDates={markedDates}
          monthFormat={'MMMM yyyy'}
          firstDay={0}
          hideExtraDays={true}
          disableAllTouchEventsForDisabledDays={true}
          theme={{
            backgroundColor: '#fff',
            calendarBackground: '#fff',
            textSectionTitleColor: '#000',
            selectedDayBackgroundColor: '#0066cc',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#0066cc',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9d9d9',
            dotColor: '#0066cc',
            arrowColor: '#0066cc',
            disabledArrowColor: '#d9d9d9',
          }}
          style={styles.calendar}
        />

        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.timeSlots}>
          {Array.isArray(field.availability) ? (
            field.availability.find((a: FieldAvailability) => a.date === selectedDate)?.slots?.length ? (
              field.availability
                .find((a: FieldAvailability) => a.date === selectedDate)
                ?.slots?.map((slot: TimeSlot) => {
                  const isBooked = slot.isBooked || isSlotBookedByCurrentUser(slot);
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.timeSlot,
                        isBooked && styles.bookedSlot,
                        selectedSlot?.id === slot.id && styles.selectedSlot,
                      ]}
                      onPress={() => {
                        if (isBooked) {
                          Alert.alert(
                            'Time Slot Unavailable',
                            isSlotBookedByCurrentUser(slot)
                              ? 'You have already booked this slot. Please select another one.'
                              : 'This time slot is already booked by another user. Please select another one.',
                            [{ text: 'OK' }]
                          );
                        } else {
                          setSelectedSlot(slot);
                        }
                      }}
                      disabled={isBooked}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          isBooked && styles.bookedSlotText,
                          selectedSlot?.id === slot.id && styles.selectedSlotText,
                        ]}
                      >
                        {slot.startTime} - {slot.endTime}
                      </Text>
                      {isBooked && (
                        <Text style={styles.bookedLabel}>
                          {isSlotBookedByCurrentUser(slot) ? 'Your Booking' : 'Booked'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })
            ) : (
              <Text style={styles.noSlotsText}>No time slots available for this date.</Text>
            )
          ) : (
            <Text style={styles.noSlotsText}>No availability information found.</Text>
          )}
        </View>

        {!isUserAdmin && ( // Conditionally render "Book Now" button for non-admins
          <TouchableOpacity
            style={[styles.bookButton, !selectedSlot && styles.disabledButton]}
            onPress={handleBooking}
            disabled={!selectedSlot}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 250,
  },
  image: {
    width: 400,
    height: 250,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sport: {
    fontSize: 18,
    color: '#0066cc',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#009900',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  contactInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  calendar: {
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  timeSlot: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  bookedSlot: {
    backgroundColor: '#ddd',
    opacity: 0.6,
  },
  selectedSlot: {
    backgroundColor: '#0066cc',
  },
  timeSlotText: {
    color: '#333',
  },
  bookedSlotText: {
    color: '#999',
  },
  selectedSlotText: {
    color: '#fff',
  },
  bookedLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default FieldDetailsScreen;
