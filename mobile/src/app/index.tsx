import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Decorative top accent */}
      <View style={styles.accentBar} />

      {/* Title section */}
      <View style={styles.titleSection}>
        <Text style={styles.eyebrow}>DAILY PUZZLE</Text>
        <Text style={styles.title}>CROSSWORD{'\n'}DUEL</Text>
        <Text style={styles.subtitle}>Race to complete the grid</Text>
      </View>

      {/* Grid decoration */}
      <View style={styles.gridDecor}>
        {Array.from({ length: 25 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.gridCell,
              (i === 2 || i === 7 || i === 12 || i === 17 || i === 22) && styles.gridCellBlack,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Pressable
          testID="solo-practice-button"
          style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.buttonPressed]}
          onPress={() => router.push('/game')}
        >
          <Text style={styles.buttonIcon}>⬛</Text>
          <View>
            <Text style={styles.buttonText}>Solo Practice</Text>
            <Text style={styles.buttonSub}>Today's puzzle</Text>
          </View>
        </Pressable>

        <Pressable
          testID="create-duel-button"
          style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.buttonPressed]}
          onPress={() => router.push('/create-duel')}
        >
          <Text style={styles.buttonIcon}>⚔️</Text>
          <View>
            <Text style={styles.buttonText}>Create Duel</Text>
            <Text style={styles.buttonSub}>Challenge a friend</Text>
          </View>
        </Pressable>

        <Pressable
          testID="join-duel-button"
          style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.buttonPressed]}
          onPress={() => router.push('/join-duel')}
        >
          <Text style={styles.buttonIcon}>🔑</Text>
          <View>
            <Text style={styles.buttonText}>Join Duel</Text>
            <Text style={styles.buttonSub}>Enter a room code</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.footer}>crossword · strategy · speed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#F5E642',
  },

  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
  },

  eyebrow: {
    color: '#F5E642',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 8,
    opacity: 0.8,
  },

  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#F5E642',
    letterSpacing: 4,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 10,
  },

  subtitle: {
    color: '#888',
    fontSize: 14,
    letterSpacing: 1,
  },

  // Decorative mini-grid
  gridDecor: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 130,
    marginBottom: 36,
    opacity: 0.35,
  },
  gridCell: {
    width: 22,
    height: 22,
    backgroundColor: '#F5F0E8',
    margin: 1,
    borderRadius: 2,
  },
  gridCellBlack: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  // Buttons
  buttons: {
    width: '100%',
    gap: 12,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },

  buttonPrimary: {
    backgroundColor: '#F5E642',
    borderColor: '#F5E642',
  },

  buttonSecondary: {
    backgroundColor: '#161616',
    borderColor: '#2A2A2A',
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  buttonIcon: {
    fontSize: 20,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F5F0E8',
    letterSpacing: 0.5,
  },

  buttonSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  footer: {
    marginTop: 32,
    color: '#333',
    fontSize: 11,
    letterSpacing: 2,
  },
});
