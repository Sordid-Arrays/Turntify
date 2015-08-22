/** 
* This holds any filters we need in our app: most notably, the 'turntFilter'.
*/

angular.module('turntify.player')
  .filter('turntTo', function() {
  
  //the "input" will be a song object from the "playlist" array, and the "turntness" will be
  // the current value of turntness
  //NOTE: selected turntness is a string for some reason
  return function(input, selectedTurntness) {
    var resultArray = [], filterArr = [[],[],[],[]], diff, songBucket, turntness = parseInt(selectedTurntness), boundaries = [(turntness-1), (turntness+4)];
    // var filterArr = [[],[],[],[]];
    // var diff;
    // var songBucket;
    // var turntness = parseInt(selectedTurntness);
    // var boundaries = [(turntness-1), (turntness+4)];
    for(var i=0; i<input.length; i++){
      songBucket = input[i].turnt_bucket;
      diff = turntness - songBucket + 1;
      if(diff === 0 || diff === 1 || diff === 2 || diff === 3){
        filterArr[diff].push(input[i]);
      };
    }
    resultArray = resultArray.concat(filterArr[1].concat(filterArr[2].concat(filterArr[0].concat(filterArr[3]))));
    return resultArray;
  };
});
