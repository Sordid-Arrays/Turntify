

GET user/playlists
* For getting a list of playlists
* Request header includes { userId: <str>, userOAuth: <str> }
* Returns [ { name : <str>, playlistId: <str>}, ... ]

GET user/playlist/:playlistId
* For getting a list of songs in a playlist
* Request header includes { userId: <str>, userOAuth: <str> }
* Takes two arguments: playlist.id <!-- , turntness -->
* Returns [ { trackName: <str>, artistName: <str>, trackId: <str> }, ... ]




