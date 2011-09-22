/**
 * Shared state of the app.
 * @type {Object.<!string, !string>}
 * @private
 */
var state_ = null;

/**
 * A list of the participants.
 * @type {Array.<gapi.hangout.Participant>}
 * @private
 */
var participants_ = null;

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
  preEL = $("<div id='pre'></div>").append('<button id="pre_d4" onclick="doRoll(\'1d4\');">d4</button><button id="pre_d6" onclick="doRoll(\'1d6\');">d6</button><button id="pre_d8" onclick="doRoll(\'1d8\');">d8</button><button id="pre_d10" onclick="doRoll(\'1d10\');">d10</button><button id="pre_d12" onclick="doRoll(\'1d12\');">d12</button><button id="pre_d20" onclick="doRoll(\'1d20\');">d20</button><button id="pre_d100" onclick="doRoll(\'1d100\');">d100</button><button id="pre_clear" onclick="doClear();">Clear</button>');
  jsdiceEl = $("<div id='jsdice' class='hidden'>").append(resultsEL,inpEL,preEL);
  mainEL = $("<div id='main'>").append(jsdiceEl);

  var body = $("body").append(mainEL);
}

function activateForm() { 
	  $('#jsdice').show(); 
	  $('#inp_text').focus(); 
	  jokerizer();
	}  

(function() {
  if (gapi && gapi.hangout) {

    var initHangout = function() {
      prepareAppDOM();
	  activateForm();
	  
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
