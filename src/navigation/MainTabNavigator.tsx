import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ChatbotScreen from '../screens/ChatbotScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen
                    name="Chatbot"
                    component={ChatbotScreen}
                  
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default MainTabNavigator;
