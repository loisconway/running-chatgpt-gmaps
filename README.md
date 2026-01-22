# Route planning using AI
## The Plan
The plan for this application (eventually) is for a user to be able to define the route they want to run in natural language and have a running route be created. 
For example: 'I want to run 10km starting in Greenwich and ending in whitechapel, and where possible I want to go into parks' 
The app would then use AI to generate plot points for a map and generate the route. 

## Currently
- Save and reload routes (up to 5 can be saved)
- Enter drawing mode to add or remove points on a map
- Start/end lat/long transformed into addresses using reverse geocoding
- Pop up modal for route details: distance, estimated time, elevation
- Elevation graph
- Pace setting for estimated times
  


https://github.com/user-attachments/assets/d7281bf7-0b49-4345-8598-f4492d2dc8e1


## To-Do
- AI implementation 
- How I plan to match up AI to maps
- Being able to change waypoints not just add or delete them
- Extending route beyond quickest (like I am doing in my Next-js app), so you set a few points but you want it to be longer. I'm not sure yet if this is something I will try to tackle with AI.
- UX needs a bit of a refresh, it isn't the prettiest map and generally think the map should take up more space, and the action buttons should just live on top of the map.
- Error Boundaries 
- Backend implementation to develop those skills



## Woops I broke this app in web and Google Maps Autocomplete
I think the gmaps api updated and I lost some features: autocomplete stopped working on my inputs but I removed this feature as soon I will try to go more towards AI powered inputs anyway. I also have an issue with trying to import react-native internals not supported on web. I need to make sure to separate concerns if I have web vs mobile. However, my current focus is for this app is mobile development so fixing the app in web is a later priority compared to adding new features.

# To Do
- Add a simple AI implementation simply looks for start and end points in a NL user input and transforms these to maps
- Look at different mapping options, the gmaps api is a bit tricky sometimes
- Fix web app

# To Do
- Fix or remove GooglePlacesAutocomplete 
- Add a simple AI implementation simply looks for start and end points in a NL user input and transforms these to maps
- Look at different mapping options, the gmaps api is a bit tricky sometimes
- Deploy app

# Running the app 
Running the app locally is pretty simple but you need a google maps api key (REACT_APP_GOOGLE_MAPS_API_KEY) in your .env 
I looked into deployment but looked a little tricky with testflight etc for apple so just put that a bit further down the to do list while I develop more features.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
