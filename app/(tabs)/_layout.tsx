import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import Colors from '../../constants/Colors';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="search"
        options={{
          // headerShown: false,
          headerTitleAlign:'left',
          title: 'UChat|Search',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'UChat|Chat',
          headerTitleAlign:'left',
          // headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="comment" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          // headerShown: false,

          title: 'Uchat|Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          // headerShown: false, 
          title: 'Inbox',
          tabBarIcon: ({ color }) => <TabBarIcon name="inbox" color={color} />,
        }}
      />

    </Tabs>
  );
}
