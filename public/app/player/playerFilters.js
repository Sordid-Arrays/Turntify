/** 
* This holds any filters we need in our app: most notably, the 'turntFilter'.
*/

angular.module('turntify.player')
  .filter('turntTo', function() {
  
  //the "input" will be a song object from the "playlist" array, and the "turntness" will be
  // the current value of turntness
  //NOTE: selected turntness is a string for some reason
  var resultArray = [], filterArr = [[],[],[],[]], diff, songBucket, turntness, boundaries;
  return function(input, selectedTurntness) {
    turntness = parseInt(selectedTurntness);
    boundaries = [(turntness-1), (turntness+4)];
    filterArr = [[],[],[],[]];
    resultArray = [];
    input.forEach(function(song){
      songBucket = song.turnt_bucket;
      diff = turntness - songBucket + 1;
      if(diff === 0 || diff === 1 || diff === 2 || diff === 3){
        filterArr[diff].push(song);
      };
    });
    resultArray = resultArray.concat(filterArr[1].concat(filterArr[2].concat(filterArr[0].concat(filterArr[3]))));
    return resultArray;
  };
});
