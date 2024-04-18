import {ActivityIndicator, Alert, BackHandler, StyleSheet, Text, TextInput, TouchableOpacity,View,} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ClipBoard from "expo-clipboard";

import getLanguages from "./api/getLanguages";
import supportedLanguages from "./api/supportedLanguages";
import detectLanguage from "./api/detectLanguage";
import translateText from "./api/translateText";

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const DEFAULT_LANGUAGE_TEXT = {
    source: "English",
    target: "French"
  };

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      let detectedLanguage = sourceLanguage;
      if (sourceLanguage === "auto") {
        detectedLanguage = await detectLanguage(text);
        setSourceLanguage(detectedLanguage);
      }
      const translatedText = await translateText(
        text,
        detectedLanguage,
        targetLanguage
      );
      setTranslatedText(translatedText);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const updateSourceLanguage = (newLanguage) => {
    if (newLanguage === targetLanguage) {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
    } else {
      setSourceLanguage(newLanguage);
    }
  };
  
  const updateTargetLanguage = (newLanguage) => {
    if (newLanguage === sourceLanguage) {
      setTargetLanguage(sourceLanguage);
      setSourceLanguage(targetLanguage);
    } else {
      setTargetLanguage(newLanguage);
    }
  };

  useEffect(() => {
    const storeLanguages = async (languages) => {
      try {
        await AsyncStorage.setItem("getLanguage", JSON.stringify(languages));
        setLanguages(languages);
      } catch (e) {
        console.error("Failed to store languages in AsyncStorage:", e);
      }
    };

    const fetchLanguages = async () => {
      try {
        const languages = await getLanguages();
        await storeLanguages(languages);
      } catch (error) {
        Alert.alert(
          "Language Recovery Error",
          error.message,
          [{ text: "OK", onPress: () => BackHandler.exitApp() }],
          { cancelable: false }
        );
      }
    };

    const loadLanguages = async () => {
      try {
        const storedLanguages = await AsyncStorage.getItem("getLanguage");
        if (storedLanguages !== null) {
          setLanguages(JSON.parse(storedLanguages));
        } else {
          await fetchLanguages();
        }
      } catch (e) {
        console.error("Failed to load languages from AsyncStorage:", e);
      }
    };

    loadLanguages();
  }, []);

  const copyToClipboard = useCallback(async () => {
    await ClipBoard.setStringAsync(translatedText);
  }, [translatedText]);
  const renderPickerItem = (item, selectedLanguage) => {
    const languageCode = item.language;
    return (
      <Picker.Item
        style={languageCode === selectedLanguage ? { color: colors.bleu } : {}}
        label={supportedLanguages[languageCode]}
        value={languageCode}
        key={languageCode}
      />
    );
  };

  const renderLanguagePicker = (
    languages,
    selectedLanguage,
    setLanguage,
    type
  ) => {
    return languages.length > 0 ? (
      <Picker
        style={styles.languageOptionText}
        selectedValue={selectedLanguage}
        onValueChange={setLanguage}
      >
        {type === "source" && <Picker.Item label="Auto Detect" value="auto" style={selectedLanguage === "auto" ? { color: colors.bleu } : {}}/>}
        {languages.map((language) =>
          renderPickerItem(language, selectedLanguage)
        )}
      </Picker>
    ) : (
      <Text style={styles.languageOptionText}>
        {DEFAULT_LANGUAGE_TEXT[type]}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Translate</Text>
      </View>
      <View style={styles.languageContainer}>
        <View style={styles.languageOption}>
          {renderLanguagePicker(
            languages,
            sourceLanguage,
            updateSourceLanguage,
            "source"
          )}
        </View>
        <View style={styles.arrowContenaire}>
          <AntDesign name="arrowright" size={24} color={colors.primary} />
        </View>
        <View style={styles.languageOption}>
          {renderLanguagePicker(
            languages,
            targetLanguage,
            updateTargetLanguage,
            "target"
          )}
        </View>
      </View>
      <View style={styles.inputContenaire}>
        <TextInput
          multiline
          placeholder="Enter text"
          style={styles.textInput}
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          disabled={text.trim() === ""}
          style={styles.iconContainer}
          onPress={isLoading ? undefined : onSubmit}
        >
          {isLoading ? (
            <ActivityIndicator size={"small"} color={colors.primary} />
          ) : (
            <Ionicons
              name="arrow-forward-circle-sharp"
              size={24}
              color={text.trim() === "" ? colors.disableBleu : colors.bleu}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{translatedText}</Text>

        <TouchableOpacity
          style={styles.iconContainer}
          disabled={translatedText.trim() == ""}
          onPress={copyToClipboard}
        >
          <MaterialIcons
            name="content-copy"
            size={24}
            color={translatedText == "" ? colors.disable : colors.black}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const colors = {
  background: "#12113b71",
  primary: "#5dade0",
  bleu: "#537aa8",
  disableBleu: "#537aa871",
  white: "#fffffc",
  black: "#0e0e0e",
  disable: "#00000071",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  titleContainer: {
    width: "100%",
    padding: 25,
    alignItems: "center",
    backgroundColor: colors.bleu,
    borderBottomColor: colors.background,
    borderBottomWidth: 1,
  },
  title: {
    color: colors.white,
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 1,
  },
  languageContainer: {
    flexDirection: "row",
    borderBottomColor: colors.background,
    borderBottomWidth: 1,
  },
  languageOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowContenaire: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  languageOptionText: {
    color: colors.bleu,
    letterSpacing: 0.5,
    width: "100%",
    alignItems: "center",
    textAlign: "center",
  },
  inputContenaire: {
    flexDirection: "row",
    borderBottomColor: colors.background,
    borderBottomWidth: 1,
  },
  textInput: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    letterSpacing: 0.5,
    height: 150,
    color: colors.black,
    textAlignVertical: "top",
  },
  iconContainer: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  resultContainer: {
    flexDirection: "row",
    borderBottomColor: colors.background,
    borderBottomWidth: 1,
    height: 150,
    paddingVertical: 20,
  },
  resultText: {
    letterSpacing: 0.5,
    color: colors.primary,
    flex: 1,
    marginHorizontal: 15,
  },
  picker: {
    width: 200,
    height: 40,
  },
});
