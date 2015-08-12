var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
* save new token cookie
*/
function updateSessionToken (req, newAccessToken, newRefreshToken) {
  req.session.user.access_token = newAccessToken;
  if (newRefreshToken) {
    req.session.user.refresh_token = newRefreshToken;
  }
}

module.exports = {
  generateRandomString: generateRandomString,
  updateSessionToken: updateSessionToken
};
