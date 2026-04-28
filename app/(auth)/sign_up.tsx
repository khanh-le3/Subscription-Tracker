import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const SignUp = () => {
  return (
    <View>
      <Text>sign_up</Text>
      <Link href="./(auth)/sign_in" className="text-blue-500 underline">
        Already have an account? Sign In
      </Link>
    </View>
  )
}

export default SignUp