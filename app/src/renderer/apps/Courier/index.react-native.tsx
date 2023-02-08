import { View, Text, Image } from 'react-native';
import ChatIcon from './assets/chat-icon.svg';

export const CourierRoot = () => (
  <View style={{ flex: 1, height: '100%' }}>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        height: 50,
      }}
    >
      <Image source={'/assets/chat-icon.svg'} />
      <Text
        style={{
          fontSize: 16,
          textTransform: 'uppercase',
          fontWeight: 600,
          fontFamily: 'Rubik',
          opacity: 0.7,
        }}
      >
        Courier
      </Text>
    </View>
  </View>
);
