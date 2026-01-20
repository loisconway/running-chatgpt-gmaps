## Woops I broke this app
Had some issues with gmaps api, was playing about with a few things and the app is in a bit of a broken state, but the working branch where most of the changes I have is feature/google-maps-2 so have a look at that to see what I have been trying lol

I think the gmaps api updated and I lost some features, I also have an issue with trying to import react-native internals not supported on web. I need to make sure to separate concerns if I have web vs mobile.

Visuals still run on mobile and I can open some of my saved routes but I cant add new routes due to the searching and GooglePlacesAutocomplete not working anymore, need to look into this. But I was more focused on getting it working on IOS so I think this is a lower priority for me.

Gmaps issue I think is that there is a new places API and I need to set it up in my google dev account.

# To Do
- Fix or remove GooglePlacesAutocomplete 
- Add the ability to add places by touching the map instead 
- Add a simple AI implementation simply looks for start and end points in a NL user input and transforms these to maps
- Look at different mapping options, the gmaps api is a bit tricky

# Route planning using AI
## The Plan
The plan for this application (eventually) is for a user to be able to define the route they want to run in natural language and have a running route be created. 
For example: 'I want to run 10km starting in Greenwich and ending in whitechapel, and where possible I want to go into parks' 
The app would then use AI to generate plot points for a map and generate the route. 

## Currently
- Render a route between two points
- Save and reload routes 
- Autocomplete when searching locations 
- Google maps API (I might've broken this)

## To-Do
- AI implementation 
- How I plan to match up AI to maps 
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
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
