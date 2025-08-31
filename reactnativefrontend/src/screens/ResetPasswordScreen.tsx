import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from "react-native";
import axios from "axios";

const ResetPasswordScreen = ({ navigation }: any) => {
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleResetPassword = async () => {
        if (!token || !newPassword) {
            Alert.alert("Error", "Please enter all fields");
            return;
        }

        try {
            const response = await axios.post<{ message: string }>("http://10.81.219.246:3000/api/user/reset-password", { token, password: newPassword });
            Alert.alert("Success", response.data.message);
            navigation.navigate("Login");
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.error || "Reset failed");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Reset Token"
                onChangeText={setToken}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter New Password"
                onChangeText={setNewPassword}
                secureTextEntry
            />
            <Button title="Reset Password" onPress={handleResetPassword} />
            <Button title="Back to Login" onPress={() => navigation.navigate("Login")} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default ResetPasswordScreen;
