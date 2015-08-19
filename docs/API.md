

GET user/playlists
* For getting a list of playlists
* Request header includes { userId: <str>, userOAuth: <str> }
* Returns [ { name : <str>, playlistId: <str>, ownerId: <str>}, ... ]

GET user/playlist/:ownerId/:playlistId
* For getting a list of songs in a playlist
* Request header includes { userId: <str>, userOAuth: <str> }
* OwnerId is the ID of the owner of the playlist - not necessarily the logged-in user
* Takes three arguments: owner.id, playlist.id, turntness
* Returns [
  {
    spotify_id: { type: String, required: true},
    echonest_id: { type: String, required: true},
    artist_name: { type: String, required: false},
    title: { type: String, required: false},
    danceability: { type: Number, required: false},
    energy: { type: Number, required: false},
    duration: { type: Number, required: false},
    album_name: { type: String, required: false},
    turnt_bucket: {type: Number, required: false}
  }
]

to search for song : /song
song name will be in req.query
this is a get

GET user/playlist/:ownerId/:playlistId
* For getting ALL songs in a playlist
* Request header includes { userId: <str>, userOAuth: <str> } (I think)
* OwnerId is the ID of the owner of the playlist - not necessarily the logged-in user
* Takes three arguments: owner.id, playlist.id
* Returns song objects in the same format as the above request


to insert song into playlist
/addsong/:playlistId
you will send the spotify song id inside the req.body.songId
this is a post


to create playlist or update playlist with imported songs
/saveplaylist/:playlistName/:turntness
you will send the songs in req.body.song
this is a post
