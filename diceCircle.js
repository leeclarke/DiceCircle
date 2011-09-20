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
prepareAppDOM() {

//TODO: Replace with needed UI elements
  statusInput_ = $('<input />')
      .attr({
        'id': 'status-input',
        'type': 'text',
        'maxlength': MAX_STATUS_LENGTH
      });
  statusForm_ = $('<form />')
      .attr({
        'action': '',
        'id': 'status-form'
      })
      .append(statusInput_);

  var statusDiv = $('<div />')
      .attr('id', 'status-box')
      .addClass('status-box')
      .append(statusForm_);

  statusForm_.submit(function() {
    onSubmitStatus();
    return false;
  });

  statusInput_.keypress(function(e) {
    if (e.which === 13) {
      defer(onSubmitStatus);
    }
    e.stopPropagation();
  }).blur(function(e) {
    onSubmitStatus();
    e.stopPropagation();
  }).mousedown(function(e) {
    e.stopPropagation();
  }).hide();

  container_ = $('<div />');

  var body = $('body');
  body.mousedown(function(e) {
    if (statusVisible_) {
      onSubmitStatus();
    }
    e.stopPropagation();
  }).append(container_, statusDiv);
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