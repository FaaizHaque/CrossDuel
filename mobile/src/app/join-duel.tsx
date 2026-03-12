import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { ref, get, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter } from "expo-router";

export default function JoinDuel() {
    const router = useRouter();

  const [code, setCode] = useState("");
  async function handleJoinGame() {

    if (code.length !== 6) {
      alert("Enter a valid 6 digit code");
      return;
    }
  
    const gameRef = ref(db, "games/" + code);
  
    const snapshot = await get(gameRef);
  
    if (!snapshot.exists()) {
      alert("Game not found");
      return;
    }
  
    await update(gameRef, {
        guestReady: true
      });
      
      router.push(`/game?code=${code}`);
  }
  return (
    <View style={styles.container}>

      <Text style={styles.title}>JOIN DUEL</Text>

      <Text style={styles.label}>Enter Game Code</Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={6}
        placeholder="000000"
        placeholderTextColor="#555"
      />

<TouchableOpacity style={styles.button} onPress={handleJoinGame}>
        <Text style={styles.buttonText}>Join Game</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    paddingTop: 120,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F5E642",
    letterSpacing: 3,
    marginBottom: 40,
  },

  label: {
    color: "#AAA",
    marginBottom: 10,
    letterSpacing: 2,
  },

  input: {
    width: 220,
    height: 50,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    color: "#F5F5F0",
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 6,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#F5E642",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 6,
  },

  buttonText: {
    color: "#000",
    fontWeight: "700",
  },

});