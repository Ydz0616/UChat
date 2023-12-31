import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, router, useNavigation } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';

import { Accelerometer } from 'expo-sensors';
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
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isShaking, setShaking] = useState(false);
  
  useEffect(() => {
    const subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;
      const acceleration = Math.sqrt(x ** 2 + y ** 2 + (z/2) ** 2);
      const shakeThreshold = 1.5;

      if (acceleration > shakeThreshold) {
        console.log(`x: ${x}, y: ${y}, z: ${z}`)
        router.replace('/search');
        setShaking(true);
      } else {
        setShaking(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="search"
        options={{
          // headerShown: false,
          tabBarShowLabel: false, 
          headerTitleAlign: 'left',
          title: 'UChat|Search',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'UChat|Chat',
          tabBarShowLabel: false, 
          headerTitleAlign: 'left',
          // headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="comment" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarShowLabel: false, 
          headerShown: false,
          title: 'Uchat|Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          tabBarShowLabel: false, 
          // headerShown: false, 
          title: 'Inbox',
          tabBarIcon: ({ color }) => <TabBarIcon name="inbox" color={color} />,
        }}
      />

      <Tabs.Screen
      
        name="help"
        options={{
          // headerShown: false,
          tabBarShowLabel: false,  
          title: 'Help',
          tabBarIcon: ({ color }) => <TabBarIcon name="frown-o" color={color} />,
        }}
      />

    </Tabs>
  );
}
