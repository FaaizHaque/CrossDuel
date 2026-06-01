import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { puzzles } from "../puzzles";

function generateGameCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function CreateDuel() {
    const router = useRouter();

  const [mode, setMode] = useState("classic");
  const [rounds, setRounds] = useState(1);
  const [gameCode, setGameCode] = useState<string | null>(null);

  useEffect(() => {

    if (!gameCode) return;
  
    const gameRef = ref(db, "games/" + gameCode);
  
    const unsubscribe = onValue(gameRef, (snapshot) => {
  
      const data = snapshot.val();
  
      if (data?.guestReady === true) {
        router.push(`/game?code=${gameCode}`);
      }
  
    });
  
    return () => unsubscribe();
  
  }, [gameCode]);

  async function handleGenerateCode() {

    const code = generateGameCode();
  
    const puzzleIndex = Math.floor(Math.random() * puzzles.length);// adjust if needed

await set(ref(db, "games/" + code), {
  mode: mode,
  rounds: rounds,
  puzzleIndex: puzzleIndex,
  status: "waiting",
  hostReady: false,
  guestReady: false,
  createdAt: Date.now()
});
  
    setGameCode(code);
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>CREATE DUEL</Text>

      {!gameCode && (
        <>
          <Text style={styles.section}>Mode</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setMode("classic")}
          >
            <Text style={styles.optionText}>Classic Race</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setMode("5min")}
          >
            <Text style={styles.optionText}>5 Minute Duel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setMode("7min")}
          >
            <Text style={styles.optionText}>7 Minute Duel</Text>
          </TouchableOpacity>


          <Text style={styles.section}>Rounds</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setRounds(1)}
          >
            <Text style={styles.optionText}>1 Round</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setRounds(3)}
          >
            <Text style={styles.optionText}>3 Rounds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setRounds(5)}
          >
            <Text style={styles.optionText}>5 Rounds</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateCode}
          >
            <Text style={styles.generateText}>Generate Game Code</Text>
          </TouchableOpacity>
        </>
      )}

      {gameCode && (
        <View style={styles.codeBox}>
          <Text style={styles.codeTitle}>GAME CODE</Text>
          <Text style={styles.code}>{gameCode}</Text>
          <Text style={styles.waiting}>Waiting for opponent...</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    paddingTop: 80,
  },

  title: {
    fontSize: 28,
    color: "#F5E642",
    fontWeight: "900",
    marginBottom: 30,
    letterSpacing: 3,
  },

  section: {
    color: "#AAA",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    letterSpacing: 2,
  },

  option: {
    width: 220,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    marginBottom: 10,
    alignItems: "center",
  },

  optionText: {
    color: "#F5F5F0",
    fontSize: 15,
  },

  generateButton: {
    marginTop: 30,
    backgroundColor: "#F5E642",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 6,
  },

  generateText: {
    fontWeight: "700",
    color: "#000",
  },

  codeBox: {
    alignItems: "center",
  },

  codeTitle: {
    color: "#AAA",
    letterSpacing: 2,
  },

  code: {
    fontSize: 36,
    color: "#F5E642",
    marginVertical: 20,
    letterSpacing: 8,
    fontWeight: "900",
  },

  waiting: {
    color: "#888",
  }

});