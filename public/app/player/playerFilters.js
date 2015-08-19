/** 
* This holds any filters we need in our app: most notably, the 'turntFilter'.
*/

angular.module('turntify.player')
  .filter('turntTo', function() {
  
  //the "input" will be a song object from the "playlist" array, and the "turntness" will be
  // the current value of turntness
  //NOTE: selected turntness is a string for some reason
  return function(input, selectedTurntness) {
    var resultArray = [];
    var turntness = parseInt(selectedTurntness);
    var boundaries = [turntness-2, turntness+3];
    for(var i=0; i<input.length; i++){
      var songBucket = input[i].turnt_bucket;
      if ((boundaries[0] < songBucket) && (songBucket < boundaries[1])){
        resultArray.push(input[i]);
      }
    }
    return resultArray;
  };
});
