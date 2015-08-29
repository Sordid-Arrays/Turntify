/** 
* This holds any filters we need in our app: most notably, the 'turntFilter'.
*/

angular.module('turntify.player')
  .filter('turntTo', function() {
  
  //the "input" will be a song object from the "playlist" array, and the "turntness" will be
  // the current value of turntness
  //NOTE: selected turntness is a string for some reason
  var resultArray = [], filterArr = [[],[],[],[],[]], diff, songBucket, turntness;
  return function(input, selectedTurntness) {
    turntness = parseInt(selectedTurntness);
    filterArr = [[],[],[],[],[]];
    resultArray = [];
    input.forEach(function(song){
      songBucket = song.turnt_bucket;
      diff = turntness - songBucket + 2;
      if(diff === 0 || diff === 1 || diff === 2 || diff === 3 || diff == 4){
        filterArr[diff].push(song);
      };
    });
    resultArray = resultArray.concat(filterArr[2].concat(filterArr[1].concat(filterArr[3].concat(filterArr[0].concat(filterArr[4])))));
    return resultArray;
  };
});
