import React from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Link } from "expo-router";

const SignIn: React.FC = () => {
    return (
        <View>  
            <Text> Sign In </Text>
            <Link href="./(auth)/sign_up" className="text-blue-500 underline">
                Don't have an account? Sign Up
            </Link>
            <Link href="./" className="text-blue-500 underline">
                Homepage
            </Link>
        </View>
    );
};

const styles = StyleSheet.create({
   
});

export default SignIn;