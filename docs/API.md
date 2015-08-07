

GET user/:id/playlists
* For getting a list of playlists
* Takes one argument: user.id
* Returns [ { name : <str>, playlistId: <str>}, ... ]

GET user/:id/playlist/:playlistId
* For getting a list of songs in a playlist
* Takes two arguments: playlist.id, turntness
* Returns [ { trackName: <str>, artistName: <str>, trackId: <str> }, ... ]




