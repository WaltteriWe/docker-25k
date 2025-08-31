import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from "react-native";
import axios from "axios";

const ForgotPasswordScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState("");

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        try {
            const response = await axios.post<{ message: string }>("http://10.81.219.246:3000/api/user/forgot-password", { email });
            Alert.alert("Success", response.data.message);
            navigation.navigate("ResetPassword");
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Forgot Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <Button title="Send Reset Link" onPress={handleForgotPassword} />
            <Button title="Back to Login" onPress={() => navigation.navigate("Login")} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default ForgotPasswordScreen;
