import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { Pressable } from 'react-native'

const SignUp = () => {
  return (
    <View>
      <Text>sign_up</Text>
      <Link href="./(auth)/sign_in" className="text-blue-500 underline">
        Already have an account? Sign In
      </Link>
      <Link href="./" className="text-blue-500 underline">
          Homepage
      </Link>
    </View>
  )
}

export default SignUp