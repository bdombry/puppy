import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { onboardingStyles } from '../styles/onboardingStyles';
import { colors } from '../constants/theme';
import DOG_BREEDS from '../constants/dogBreeds';

export default function BreedAutoComplete({ label, value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [showList, setShowList] = useState(false);

  const filteredBreeds = DOG_BREEDS.filter(breed =>
    breed.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (breed) => {
    setQuery(breed);
    setShowList(false);
    onChange(breed);
  };

  return (
    <View style={onboardingStyles.formGroup}>
      {label && <Text style={onboardingStyles.label}>{label}</Text>}
      <TextInput
        style={onboardingStyles.input}
        placeholder="Ex: Labrador, Berger allemand..."
        placeholderTextColor={colors.textTertiary}
        value={query}
        onChangeText={text => {
          setQuery(text);
          setShowList(true);
          onChange(''); // reset parent value until selection
        }}
        onFocus={() => setShowList(true)}
        autoCapitalize="words"
      />
      {showList && filteredBreeds.length > 0 && (
        <FlatList
          scrollEnabled={false}
          data={filteredBreeds}
          keyExtractor={item => item}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.primary,
            borderWidth: 1,
            maxHeight: 180,
            borderRadius: 8,
            marginTop: 2,
          }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={{ padding: 12 }}
            >
              <Text style={{ color: colors.text }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

BreedAutoComplete.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

BreedAutoComplete.defaultProps = {
  label: null,
  value: '',
};
