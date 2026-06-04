import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// 5×5 decorative mini-grid definition
const MINI_GRID = [
  [false, true,  false, true,  false],
  [true,  false, true,  false, true ],
  [false, true,  false, true,  false],
  [true,  false, true,  false, true ],
  [false, true,  false, true,  false],
];

const MINI_LETTERS: Record<string, string> = {
  '0-0': 'C', '0-2': 'R', '0-4': 'O',
  '2-0': 'S', '2-2': 'S', '2-4': 'W',
  '4-0': 'O', '4-2': 'R', '4-4': 'D',
};

const CELL_SIZE = 28;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} testID="home-screen">
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleLine1}>CROSS</Text>
        <Text style={styles.titleLine2}>DUEL</Text>
        <Text style={styles.subtitle}>The crossword racing game</Text>
      </View>

      {/* Decorative mini grid */}
      <View style={styles.miniGridContainer} testID="mini-grid">
        {MINI_GRID.map((row, r) => (
          <View key={r} style={styles.miniRow}>
            {row.map((isBlack, c) => (
              <View
                key={c}
                style={[styles.miniCell, isBlack ? styles.miniCellBlack : styles.miniCellWhite]}
              >
                {!isBlack && MINI_LETTERS[`${r}-${c}`] ? (
                  <Text style={styles.miniLetter}>{MINI_LETTERS[`${r}-${c}`]}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push('/game')}
          testID="play-solo-button"
          activeOpacity={0.8}
        >
          <Text style={styles.buttonPrimaryText}>Play Solo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          testID="challenge-friend-button"
          activeOpacity={0.8}
        >
          <Text style={styles.buttonSecondaryText}>Challenge a Friend</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonTertiary}
          testID="how-to-play-button"
          activeOpacity={0.8}
        >
          <Text style={styles.buttonTertiaryText}>How to Play</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text style={styles.versionText}>v1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EE',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  titleLine1: {
    fontFamily: 'Nunito_900Black',
    fontSize: 56,
    color: '#2D6A4F',
    lineHeight: 60,
    letterSpacing: 6,
  },
  titleLine2: {
    fontFamily: 'Nunito_900Black',
    fontSize: 56,
    color: '#2D6A4F',
    lineHeight: 60,
    letterSpacing: 6,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  miniGridContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
  },
  miniRow: {
    flexDirection: 'row',
  },
  miniCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
  },
  miniCellBlack: {
    backgroundColor: '#2D6A4F',
  },
  miniCellWhite: {
    backgroundColor: '#FFFFFF',
  },
  miniLetter: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#1A1A2E',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: '#2D6A4F',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPrimaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  buttonSecondary: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D6A4F',
    backgroundColor: 'transparent',
  },
  buttonSecondaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#2D6A4F',
    letterSpacing: 0.5,
  },
  buttonTertiary: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonTertiaryText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  versionText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
});
