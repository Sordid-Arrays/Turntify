

GET user/playlists
* For getting a list of playlists
* Request header includes { userId: <str>, userOAuth: <str> }
* Returns [ { name : <str>, playlistId: <str>, ownerId: <str>}, ... ]

GET user/playlist/:ownerId/:playlistId/:turntness
* For getting a list of songs in a playlist
* Request header includes { userId: <str>, userOAuth: <str> }
* OwnerId is the ID of the owner of the playlist - not necessarily the logged-in user
* Takes three arguments: owner.id, playlist.id, turntness
* Returns [ { trackName: <str>, artistName: <str>, spotifyURI: <str>, duration: <int> }, ... ]




