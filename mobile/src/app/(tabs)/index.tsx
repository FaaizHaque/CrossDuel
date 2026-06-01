import { View, StyleSheet } from 'react-native';
import CrosswordGrid from '@/components/CrosswordGrid';

export default function CrossDuelScreen() {
  return (
    <View style={styles.container} testID="cross-duel-screen">
      <CrosswordGrid />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});
