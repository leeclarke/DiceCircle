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
 * Describes the shared state of the object.
 * @type {Object.<!string, Object.<!string, *>>}
 * @private
 */
var metadata_ = null;

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
 * Creates a key for use in the shared state.
 * @param {!string} id The user's hangoutId.
 * @param {!string} key The property to create a key for.
 * @return {!string} A new key for use in the shared state.
 */
function makeUserKey(id, key) {
  return id + ':' + key;
}

/**
 * Syncs local copies of shared state with those on the server and renders the
 *     app to reflect the changes.
 * @param {!Array.<Object.<!string, *>>} add Entries added to the shared state.
 * @param {!Array.<!string>} remove Entries removed from the shared state.
 * @param {!Object.<!string, !string>} state The shared state.
 * @param {!Object.<!string, Object.<!string, *>>} metadata Data describing the
 *     shared state.
 */
function onStateChanged(add, remove, state, metadata) {
  state_ = state;
  metadata_ = metadata;
  render();
}

/**
 * Gets the value of opt_metadataKey in the shared state, or the entire
 * metadata object if opt_metadataKey is null or not supplied.
 * @param {?string=} opt_metadataKey The key to get from the metadata object.
 * @return {(Object.<string,*>|Object<string,Object.<string,*>>)} A metadata
 *     value or the metadata object.
 */
function getMetadata(opt_metadataKey) {
  return (typeof opt_metadataKey === 'string') ? metadata_[opt_metadataKey] :
      metadata_;
}

/**
 * @return {string} The user's ephemeral id.
 */
function getUserHangoutId() {
  return gapi.hangout.getParticipantId();
}

/**
 * @return {Participant} Users hangout object.
 */
function getUserParticipant() {
  return gapi.hangout.getParticipantById(gapi.hangout.getParticipantId());
}
 
/**
 * Render chared data to the group display.
 * 
 */ 
function render() {
	
	//get Participant and display info
	var user = getUserParticipant()
	$("#group").html("Name:" + user.displayName + "<BR>id:" + user.id);
}

function showUser(){
	var user = getUserParticipant()
	$("#group").html("Name:" + user.displayName + "<BR>id:" + user.id);
}

/**
 * Set up the UI
 */
function prepareAppDOM() {
  formulaEL= $("<input id='inp_text' type='text' onkeypress='return inp_keydown(event);' /><button id='inp_go' onclick='go();'>Go!</button>");
  helpEL = $("<small>Dice to roll: [<a href='javascript:doHelp();'>Help</a>]</small><br />");
  inpEL = $("<div id='inp'>").append(helpEL,formulaEL);
  resultsEL = $("<div id='results'></div>");
  groupEL = $("<div id='group'></div>");
  preEL = $("<div id='pre'></div>").append('<button id="pre_d4" onclick="doRoll(\'1d4\');">d4</button><button id="pre_d6" onclick="doRoll(\'1d6\');">d6</button><button id="pre_d8" onclick="doRoll(\'1d8\');">d8</button><button id="pre_d10" onclick="doRoll(\'1d10\');">d10</button><button id="pre_d12" onclick="doRoll(\'1d12\');">d12</button><button id="pre_d20" onclick="doRoll(\'1d20\');">d20</button><button id="pre_d100" onclick="doRoll(\'1d100\');">d100</button><button id="pre_clear" onclick="doClear(); showUser();">Clear</button>');
  jsdiceEl = $("<div id='jsdice' class='hidden'>").append(groupEL,resultsEL,inpEL,preEL);
  mainEL = $("<div id='main'>").append(jsdiceEl);

  var body = $("body").append(mainEL);
}

function activateForm() { 
	  $('#jsdice').show(); 
	  var ht = ($('#main').height())-100;
	  $('#group').height(ht);
	  $('#results').height(ht);
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
