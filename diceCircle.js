function getInitData(){

}

/**
 * Syncs local copy of the participants list with that on the server and renders
 *     the app to reflect the changes.
 * @param {!Array.<gapi.hangout.Participant>} participants The new list of
 *     participants.
 */
function onParticipantsChanged(participants) {
  participants_ = participants;
  render();
}

/**
 * Set up the UI
 */
function prepareAppDOM() {
  formulaEL= $("<input id='inp_text' type='text' onkeypress='return inp_keydown(event);' /><button id='inp_go' onclick='go();'>Go!</button>");
  helpEL = $("<small>Dice to roll: [<a href='javascript:doHelp();'>Help</a>]</small><br />");
  inpEL = $("<div id='inp'>").append(helpEL,formulaEL);
  resultsEL = $("<div id='results'></div>");
  jsdiceEl = $("<div id='jsdice' class='hidden'>").append(resultsEL,inpEL);
  mainEL = $("<div id='main'>").append(jsdiceEl);

  var body = $("body");
  body.load(function(e) { 
	  document.getElementById('jsdice').className=''; 
	  document.getElementById('inp_text').focus(); 
	  jokerizer();
	}  
  ).append(mainEL);
}

(function() {
  if (gapi && gapi.hangout) {

    var initHangout = function() {
      prepareAppDOM();

      gapi.hangout.data.addStateChangeListener(onStateChanged);
      gapi.hangout.addParticipantsListener(onParticipantsChanged);

      if (!state_) {
        var initState = gapi.hangout.data.getState();
        var initMetadata = gapi.hangout.data.getStateMetadata();
        // Since this is the first push, added has all the values in metadata in
        // Array form.
        var added = [];
        for (var key in initMetadata) {
          if (initMetadata.hasOwnProperty(key)) {
            added.push(initMetadata[key]);
          }
        }
        var removed = [];
        if (initState && initMetadata) {
          onStateChanged(added, removed, initState, initMetadata);
        }
      }
      if (!participants_) {
        var initParticipants = gapi.hangout.getParticipants();
        if (initParticipants) {
          onParticipantsChanged(initParticipants);
        }
      }

      gapi.hangout.removeApiReadyListener(initHangout);
    };

    gapi.hangout.addApiReadyListener(initHangout);
  }
})();
