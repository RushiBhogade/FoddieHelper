import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';

interface SidebarProps {
    onClose: () => void;
    onSelectCategory: (category: string) => void;
    show: boolean; // New prop to manage sidebar visibility
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, onSelectCategory, show }) => {
    if (!show) {
        return null; // Return null if show is false to hide the sidebar
    }

    const openLink = () => {
        Linking.openURL('https://www.futuristiclabs.io/');
    };

    return (
        <View style={styles.sidebar}>
            <View style={styles.header}>
                <Image
                    source={require('../images/logo.webp')}
                    style={styles.logo}
                />
                <TouchableOpacity onPress={onClose}>
                    <Image
                        source={require('../images/close.png')}
                        style={styles.closeButton}
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.option} onPress={() => { onSelectCategory('vegan'); onClose(); }}>
                <Image
                    source={require('../images/vegan.png')}
                    style={styles.optionImage}
                />
                <Text style={styles.optionText}>Vegan Foods</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={() => { onSelectCategory('vegetarian'); onClose(); }}>
                <Image
                    source={require('../images/vegetable.png')}
                    style={styles.optionImage}
                />
                <Text style={styles.optionText}>Vegetarian Foods</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={() => { onSelectCategory('dairy'); onClose(); }}>
                <Image
                    source={require('../images/dairy.png')}
                    style={styles.optionImage}
                />
                <Text style={styles.optionText}>Dairy Products</Text>
            </TouchableOpacity>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Developed by Rushikesh on behalf of Futuristic Labs</Text>
                <TouchableOpacity onPress={openLink}>
                    <Text style={[styles.footerText, styles.link]}>https://www.futuristiclabs.io/</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#fff',
        width: 250,
        borderRightWidth: 1,
        borderColor: '#ccc',
        zIndex: 1000,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eee',
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    logo: {
        width: 100, 
        height: 50, 
        resizeMode: 'contain',
    },
    closeButton: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    optionImage: {
        width: 30,
        height: 30,
        marginRight: 10,
        resizeMode: 'contain',
    },
    optionText: {
        color: 'black',
    },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 1,
        borderColor: '#eee',
        paddingTop: 10,
    },
    footerText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 12,
    },
    link: {
        color: '#0066CC',
        textDecorationLine: 'underline',
        marginTop: 5,
    },
});

export default Sidebar;
