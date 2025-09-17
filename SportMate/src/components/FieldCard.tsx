import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Field } from '../types';
import { formatCurrency } from '../utils';

interface FieldCardProps {
  field: Field;
  onPress: (field: Field) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(field)}>
      <Image
        source={{ uri: field.images[0] || 'https://via.placeholder.com/300x200' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{field.name}</Text>
        <Text style={styles.sport}>{field.sport}</Text>
        <Text style={styles.location}>{field.location}</Text>
        <Text style={styles.price}>{formatCurrency(field.price, 'IDR')}/hour</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    margin: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sport: {
    fontSize: 14,
    color: '#0066cc',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#009900',
  },
});

export default FieldCard;
