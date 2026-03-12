import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <Text style={styles.title}>CROSS DUEL</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/game")}
      >
        <Text style={styles.buttonText}>Single Player</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.button}
  onPress={() => router.push("/create-duel")}
>
  <Text style={styles.buttonText}>Create Duel</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() => router.push("/join-duel")}
>
  <Text style={styles.buttonText}>Join Duel</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#F5E642",
    marginBottom: 40,
    letterSpacing: 4,
  },

  button: {
    width: 220,
    backgroundColor: "#1E1E1E",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },

  buttonText: {
    fontSize: 16,
    color: "#F5F5F0",
    fontWeight: "700",
  },

});