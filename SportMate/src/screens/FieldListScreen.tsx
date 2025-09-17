import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import FieldCard from '../components/FieldCard';
import { Field } from '../types';
import { fieldService } from '../services/field.service';
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

type FieldListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Main'>;
};

const FieldListScreen: React.FC<FieldListScreenProps> = ({ navigation }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
        const fetchedFieldsResponse = await fieldService.getFields(); // Default page and limit will be used
        setFields(fetchedFieldsResponse.data);
    } catch (err) {
      setError('Failed to fetch fields. Please try again later.');
      console.error('Error fetching fields:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFields();
      return () => {
        // Optional cleanup
      };
    }, [fetchFields])
  );

  const handleFieldPress = (field: Field) => {
    navigation.navigate('FieldDetails', { fieldId: field.id });
  };

  const { user } = useAuth(); // Get user from AuthContext

  const handleNavigateToCreateField = () => {
    navigation.navigate('CreateFieldScreen');
  };

  const renderItem = ({ item }: { item: Field }) => (
    <FieldCard 
      field={item} 
      onPress={handleFieldPress} 
    />
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      ) : (
        <FlatList
          data={fields}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      {user?.isAdmin && (
        <TouchableOpacity style={styles.addButton} onPress={handleNavigateToCreateField}>
          <Text style={styles.addButtonText}>Add New Field</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FieldListScreen;
