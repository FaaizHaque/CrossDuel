import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CrosswordGrid from '@/components/CrosswordGrid';

export default function CrossDuelScreen() {
  const insets = useSafeAreaInsets();
  const [wordCount, setWordCount] = useState<number>(0);

  const handleWordComplete = () => {
    setWordCount((prev) => prev + 1);
  };

  return (
    <View style={styles.container} testID="cross-duel-screen">
      {/* Header bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerLabel}>PRACTICE</Text>
        <Text style={styles.wordCounter} testID="practice-word-counter">
          {wordCount} / 15
        </Text>
      </View>
      <CrosswordGrid onWordComplete={handleWordComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#F5E642',
  },
  wordCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555555',
    letterSpacing: 2,
  },
});
