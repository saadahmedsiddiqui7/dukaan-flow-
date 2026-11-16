import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { BusinessContext } from "@dukaanflow/domain";

const setupContext: BusinessContext = {
  business: {
    id: "setup-required",
    name: "Your business workspace",
    defaultCurrency: "INR",
    timeZone: "Asia/Kolkata",
    locale: "en-IN",
    stateOrUnionTerritory: null,
  },
  enabledModules: [],
};

const modules = ["Customers & suppliers", "Products & services", "Orders & payments", "Inventory", "Tasks & team", "Dukaan AI"];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>DUKAANFLOW</Text>
        <Text style={styles.title}>One workspace for your business.</Text>
        <Text style={styles.subtitle}>A universal business core, with tools that fit the way you work.</Text>
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>WORKSPACE SETUP</Text>
          <Text style={styles.panelTitle}>{setupContext.business.name}</Text>
          <Text style={styles.body}>Choose your business profile and modules to get started.</Text>
        </View>
        {modules.map((item) => <View style={styles.module} key={item}><Text style={styles.moduleText}>{item}</Text></View>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f8fc" },
  content: { padding: 24, paddingTop: 36 },
  brand: { color: "#5652d8", fontWeight: "700", letterSpacing: 1, marginBottom: 20 },
  title: { color: "#172033", fontSize: 34, lineHeight: 40, fontWeight: "700" },
  subtitle: { color: "#5e6678", fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 26 },
  panel: { backgroundColor: "white", borderColor: "#e6e8f0", borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 14 },
  eyebrow: { color: "#777f90", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  panelTitle: { color: "#172033", fontSize: 20, fontWeight: "700", marginTop: 8 },
  body: { color: "#5e6678", fontSize: 14, lineHeight: 21, marginTop: 8 },
  module: { backgroundColor: "white", borderColor: "#e6e8f0", borderWidth: 1, borderRadius: 12, padding: 18, marginTop: 10 },
  moduleText: { color: "#172033", fontWeight: "600", fontSize: 15 },
});
