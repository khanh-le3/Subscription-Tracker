import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView as SafeAreaViewRN } from "react-native-safe-area-context";
import {styled} from "nativewind";
const SafeAreaView = styled(SafeAreaViewRN);

const insights = () => {
  return (
    <SafeAreaView className="flex-1 bg-background ">
      <Text>insights</Text>
    </SafeAreaView>
  )
}

export default insights