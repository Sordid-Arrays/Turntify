/** 
* This holds any filters we need in our app: most notably, the 'turntFilter'.
*/

angular.module('turntify.player')
  .filter('turntTo', function() {
  
  //the "input" will be a song object from the "playlist" array, and the "turntness" will be
  // the current value of turntness
  
  /**
  * Declare variables in closure in the hopes that browsers don't create additional memory for the same variables.
  * TODO: find out if this is true. at all.
  * Data the proper songs will be filtered by best fit: the best fitting songs will be in the middle of the filter array
  * of arrays, the poorest fits at the end.
  */
  var resultArray = [], filterArr = [[],[],[],[],[]], diff, songBucket, turntness;
  return function(input, selectedTurntness) {
    //selectedTurntness is stored as a string, to interact properly with the Angular Material directive
    turntness = parseInt(selectedTurntness);
    //"filterArr" stores the 5 different categories into which the songs are filtered.
    filterArr = [[],[],[],[],[]];
    resultArray = [];
    input.forEach(function(song){
      songBucket = song.turnt_bucket;
      diff = turntness - songBucket + 2;
      //Ideally, we are storing the 5 nearest buckets for the user's playlist: 1 would contain 0,1,2,3
      if(diff === 0 || diff === 1 || diff === 2 || diff === 3 || diff == 4){
        filterArr[diff].push(song);
      };
    });
    resultArray = resultArray.concat(filterArr[2].concat(filterArr[1].concat(filterArr[3].concat(filterArr[0].concat(filterArr[4])))));
    return resultArray;
  };
});
