import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import CrosswordGrid from "../components/CrosswordGrid";
import { puzzles } from "../puzzles";

export default function Game() {

  const params = useLocalSearchParams();
const code = Array.isArray(params.code) ? params.code[0] : params.code;

  const [puzzle, setPuzzle] = useState(null);

  useEffect(() => {

    if (!code) return;

    const gameRef = ref(db, "games/" + code);

    const unsubscribe = onValue(gameRef, (snapshot) => {

      const data = snapshot.val();
      console.log("GAME DATA:", data);
    
      if (!puzzle && data?.puzzleIndex !== undefined && puzzles[data.puzzleIndex]) {
        setPuzzle(puzzles[data.puzzleIndex]);
      }
    
      // 🔹 If opponent finished
      if (data?.status === "finished" && puzzle) {
        alert("Opponent finished! You lost.");
      }
    
    });

    return () => unsubscribe();

  }, [code]);

  if (!puzzle || !code) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#000" }}>
        <Text style={{ color:"white" }}>
          Loading puzzle...
        </Text>
      </View>
    );
  }

  return (
    <CrosswordGrid
      puzzle={puzzle}
      isMultiplayer={true}
      gameCode={code as string}
      playerRole={"guest"}
    />
  );
}