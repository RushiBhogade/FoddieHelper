Foodie Helper App
Foodie Helper is a mobile application designed to help users find recipes using text input or voice commands. This app utilizes React Native for cross-platform compatibility and integrates with the Spoonacular API to fetch recipe data.

Features
Search Recipes: Users can search for recipes by entering keywords or using voice input.
Voice Recognition: Integrated voice recognition allows users to search recipes hands-free.
Recipe Details: View detailed information about each recipe, including ingredients and instructions.
Shopping List: Users can maintain a shopping list for recipes, storing ingredients they need to purchase.
Installation
Before running the app, make sure you have Node.js, npm (Node Package Manager), and Expo CLI installed on your development machine.

Clone the repository:
git clone https://github.com/your_username/foodie-helper-app.git
cd foodie-helper-app

Install dependencies:
npm install

Set up environment variables:

Create a .env file in the root directory.

Add your Spoonacular API key:
SPOONACULAR_API_KEY=**********************

Run the application:
npm start
This will start the Expo development server. You can run the app on an Android or iOS simulator/emulator or scan the QR code with the Expo Go app on your physical device.

Usage
Search Recipes:
Enter keywords in the search bar and press the "Search" button to find recipes.
Use the microphone icon to initiate voice recognition for hands-free searching.
View Recipe Details:
Tap on a recipe card to expand and view detailed information, including ingredients and instructions.
Shopping List:
Add ingredients to a shopping list from recipe details.
Manage and delete items as needed.
Technologies Used
React Native
Axios for API requests
AsyncStorage for local data storage
React Native Paper for UI components
React Native Community Voice for voice recognition
React Navigation for navigation
Contributing
Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

License
This project is licensed under the MIT License - see the LICENSE file for details.