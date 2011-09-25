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
 * @privatevar 
 */
var metadata_ = null;

/**
 * The list of group dice rolls from shared state.
 */
var rollHistory_  = null;

var ROLL_HISTORY = "ROLL_HISTORY";

( function(){
  /**
   * Makes an RPC call to add and/or remove the given value(s) from the shared
   * state.
   * @param {?(string|Object.<!string, !string>)} addState  Either an object
   *     denoting the desired key value pair(s), or a single string key.
   * @param {?(string|Object.<!string, !string>)} opt_removeState A list of keys
   *     to remove from the shared state.
   */
  var submitDeltaInternal = function(addState, opt_removeState) {
    gapi.hangout.data.submitDelta(addState, opt_removeState);
  };

/**
   * Packages the parameters into a delta object for use with submitDelta.
   * @param {!(string|Object.<!string, !string>)}  Either an object denoting
   *     the desired key value pair(s), or a single string key.
   * @param {!string} opt_value If keyOrState is a string, the associated string
   *     value.
   */
  var prepareForSave = function(keyOrState, opt_value) {
    var state = null;
    if (typeof keyOrState === 'string') {
      state = {};
      state[keyOrState] = opt_value;
    } else if (typeof keyOrState === 'object' && null !== keyOrState) {
      // Ensure that no prototype-level properties are hitching a ride.
      state = {};
      for (var key in keyOrState) {
        if (keyOrState.hasOwnProperty(key)) {
          state[key] = keyOrState[key];
        }
      }
    } else {
      throw 'Unexpected argument.';
    }
    return state;
  };

  /**
   * Packages one or more keys to remove for use with submitDelta.
   * @param {!(string|Array.<!string>)} keyOrListToRemove A single key
   *     or an array of strings to remove from the shared state.
   * @return {!Array.<!string>} A list of keys to remove from the shared state.
   */
  var prepareForRemove = function(keyOrListToRemove) {
    var delta = null;
    if (typeof keyOrListToRemove === 'string') {
      delta = [keyOrListToRemove];
    } else if (typeof keyOrListToRemove.length === 'number' &&
               keyOrListToRemove.propertyIsEnumerable('length')) {
      // Discard non-string elements.
      for (var i = 0, iLen = keyOrListToRemove.length; i < iLen; ++i) {
        if (typeof keyOrListToRemove[i] === 'string') {
          delta.push(keyOrListToRemove[i]);
        }
      }
    } else {
      throw 'Unexpected argument.';
    }
    return delta;
  };

  saveValue = function(keyOrState, opt_value) {
    var delta = prepareForSave(keyOrState, opt_value);
    if (delta) {
      submitDeltaInternal(delta);
    }
  };

  removeValue = function(keyOrListToRemove) {
    var delta = prepareForRemove(keyOrListToRemove);
    if (delta) {
      submitDeltaInternal({}, delta);
    }
  };

  submitDelta = function(addState, opt_removeState) {
    if ((typeof addState !== 'object' && typeof addState !== 'undefined') ||
        (typeof opt_removeState !== 'object' &&
         typeof opt_removeState !== 'undefined')) {
      throw 'Unexpected value for submitDelta';
    }
    var toAdd = addState ? prepareForSave(addState) : {};
    var toRemove = opt_removeState ? prepareForRemove(opt_removeState) :
        undefined;
    submitDeltaInternal(toAdd, toRemove);
  };	
})();

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
  setRollHistory();
  render();
}

function setRollHistory() {
	var histSerialized = getMetadata(ROLL_HISTORY);	
	if (typeof histSerialized.value !== 'string') {
		return null;
	} else if(histSerialized.value === "") {
		//Was reset, init
		rollHistory_ = initRollHistory();
	} else {
		rollHistory_ = $.parseJSON(histSerialized.value);
	}
}

function initRollHistory() {
	return {"rolls":[]};
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
 * Generates a unique key for the new date going into the shared state.
 */
function getUserDataId() {
	return Date.now()+"|"+getUserHangoutId();
}

/**
 * Adds a new die roll to the shared state. Since you can only store Strings 
 * in the shared state it must be parsed for display later.
 * @param {dieRoll <String|String>} Roll outcome  dice|result
 */
function addNewDieRoll(dieRoll) {
	console.log("New Die roll "+dieRoll);
	var newRoll = {"participant":getUserParticipant(), "dieRoll":dieRoll };
	rollHistory_.rolls.push(newRoll);
	saveValue(ROLL_HISTORY, JSON.stringify(rollHistory_));
}

/**
 * @return {Participant} Users hangout object.
 */
function getUserParticipant() {
  return gapi.hangout.getParticipantById(gapi.hangout.getParticipantId());
}

function getParticipantName(id) {
	for(p=0; p< participants_.length ;p++) {
		if(participants_[p].id == id) {
			return participants_[p].displayName;
		}
	}
}
 
/**
 * Render chared data to the group display.
 * 
 */ 
function render() {	
	var rollOutput = "";
	for(r =0; r<rollHistory_.rolls.length; r++) {
		var rEntry = rollHistory_.rolls[r];
		if(getUserParticipant().id  === rEntry.participant.id ) {
			rollOutput += "<span><div class='roll_group_name_me'>" + rEntry.participant.displayName + ":</div>"
		} else {
			rollOutput += "<span><div class='roll_group_name'>" + rEntry.participant.displayName + ":</div>"
		}
		rollOutput += "<span><div class='roll_group_source'><small><strong>Roll:</strong></small> <a href='javascript:doRoll(\''+dice+'\');'><code>"+rEntry.dieRoll.dice+"</code></a></div>";
		rollOutput += '<div class="roll_group_result">' + rEntry.dieRoll.result + "</div></span></span><br>";
	}
	$("#group").html(rollOutput);
	//$("#group").prop("scrollHeight");
	$("#group").prop("scrollTop", $("#group").prop("scrollHeight"));//    animate({ scrollTop: $("#group").attr("scrollHeight") - $('#group').height() }, 3000);

}

function showUser(){
	var user = getUserParticipant();
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
		removeValue(ROLL_HISTORY);
	  if(!rollHistory_) {
		 rollHistory_ = initRollHistory();
		 saveValue(ROLL_HISTORY, JSON.stringify(rollHistory_));
	  }
	  prepareAppDOM();
	  activateForm();
	  
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
    
	  gapi.hangout.addParticipantsListener(onParticipantsChanged);
      gapi.hangout.data.addStateChangeListener(onStateChanged);

    gapi.hangout.addApiReadyListener(initHangout);
  }
})();
