# SpotifApi

SpotifApi is a lightweight and easy-to-use wrapper for the Spotify Web API. With this API wrapper, you can easily access Spotify's rich collection of music data, including searching for tracks, albums, artists, and more, as well as managing user playlists, and interacting with user profiles.

## Features

- **Search Spotify**: Perform searches for tracks, albums, artists, and playlists.
- **Manage Playlists**: Create, modify, and update user playlists.
- **User Profiles**: Retrieve information about the current user and their followed artists.
- **Tracks and Playback**: Access track details and manage playback functionalities.

## Prerequisites

To use SpotifApi, you will need to create a Spotify Developer account and set up an app. You will then get the following credentials:

1. **Client ID**
2. **Client Secret**
3. **Redirect URI**

Sign up and create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

## Installation

Clone the repository:

```bash
git clone https://github.com/Francesco-Greca/SpotifApi.git
```

Navigate into the project folder and install dependencies:

```bash
cd SpotifApi
npm install
```

## Getting Started

To get started with SpotifApi, follow these steps:

1. Create a `.env` file at the root of your project.
2. Add your Spotify app credentials to the `.env` file:

   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:your_redirect_uri
   ```

3. Start the server:

   ```bash
   npm start
   ```

   This will launch the application and allow you to interact with Spotify's API.

## Usage

Here’s a simple example of how to authenticate a user and search for a track:

```javascript
const spotifyApi = require('./src/spotifyApi');

// Authorize user
spotifyApi.authorize();

// Search for a track
spotifyApi.searchTracks('Bohemian Rhapsody').then(data => {
  console.log('Search results:', data.body);
});
```

### API Endpoints

- **Authorization**: `/authorize`
- **Search**: `/search?q={query}`
- **User Profile**: `/me`
- **User Playlists**: `/me/playlists`

You can find more detailed examples and usage in the [documentation](./docs).

## Contributing

We welcome contributions! Please feel free to submit pull requests or open issues to help improve this project.

### Steps to Contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
"""
