/* Javascript for Check In! */

var coords = {
  latitude: null,
  longitude: null,
  note: null,
  db: ''
};

( function(){

  $('.mainApp').hide();
  $('.viewAll').hide();
  $('.prevMap').hide();

  initDB();
  attachEventsToElements();

  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  function success(pos) {
    
    var crd = pos.coords;

    coords.latitude = crd.latitude;
    coords.longitude = crd.longitude;

    var latlon = coords.latitude + "," + coords.longitude;

    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=290x252&sensor=false";

    $("#mapHolder").html("<h4>You are here now </h4><img src='"+img_url+"'>");

  }

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}() );

function attachEventsToElements(){

  $('#checkIn-btn').on('click', function(){

    $('.checkIn').hide( function(){

      $('.mainApp').fadeIn('fast');
      $('#notes').val('');
    
    });
  });
  
  $('#saveNotes').on('click', function(ev){
    
    ev.preventDefault();
    
    coords.note = $('#notes').val();

    saveNote();
  });

  $('.goBack').on('click', function(){

    $('.viewAll, .mainApp').hide( function(){

        $('.checkIn').fadeIn();
    });
  });

  $('.goBackList').on('click', function(){

    $('.prevMap').hide( function(){

        $('.viewAll').fadeIn();
    });
  });

  $('#viewAll-btn').on('click', function(){

    $('.checkIn').hide( function(){

      $('.viewAll').fadeIn();

        $('#prevList ul').html('');
        viewPrevious();
    });
  });

  $(document).on('click', '.list',  function(){

    var lat = parseFloat( $(this).find('.list_latitude').text() );
    var lon = parseFloat( $(this).find('.list_longitude').text() );
    var note = $(this).find('.list_note').text();
    var latlon = lat + "," + lon;
    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=290x252&sensor=false";

    $("#prevMapHolder").html("<h4>You were here </h4><img src='"+img_url+"'>");

    $('.viewAll').hide( function(){

      $('.prevMap').fadeIn();
    })

    $('#showComment').html('<em>'+note+'</em>');
  });
  return true;
}

function initDB(){

  var request = indexedDB.open('notesdb', 1);

  request.onsuccess = function (e) {
    // e.target.result has the connection to the database
    coords.db = request.result;
  };

  request.onerror = function (e) {

     console.log("Creation error:"+ e);
  };

  request.onupgradeneeded = function (e) {

    // e.target.result holds the connection to database
    coords.db = e.target.result;

    if ( coords.db.objectStoreNames.contains("notes") ) {

      coords.db.deleteObjectStore("notes");
    }

    var objectStore = coords.db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
  };
  return true;
}

function saveNote(){

  var note = coords.note;
  var lat = coords.latitude;
  var lon = coords.longitude;

    // Handling addition of notes to db
    // the note
    var note = {'note':note, 'latitude':lat, 'longitude':lon};

    var transaction = coords.db.transaction([ 'notes' ], 'readwrite');

    // add the note to the store
    var store = transaction.objectStore('notes');
    
    var request = store.add(note);
    
    request.onsuccess = function (e) {
    
      alert("Your note has been saved");
    };
   
    request.onerror = function (e) {
      
      alert("Error in saving the note. Reason : " + e.value);
    };
}

function viewPrevious(){

    var objectStore = coords.db.transaction("notes").objectStore("notes");
    
    objectStore.openCursor().onsuccess = function(event) {

      var cursor = event.target.result;

      if (cursor) {

        if( ( cursor.value.latitude === null && typeof variable === "object" ) || ( cursor.value.longitude === null && typeof cursor.value.longitude === "object" ) ){
          $('#prevList ul').append('<li class="list"><i class="fa fa-caret-square-o-right fa-3x pull-left"></i> <small>Lat.: <span class="list_latitude"><em>'+cursor.value.latitude+'</em></span> &nbsp;&nbsp;&nbsp;<strong>Lon.: </strong><span class="list_longitude"><em>'+cursor.value.longitude+'</em></span></small><br><strong>Note: </strong><span class="list_note">'+cursor.value.note+'</span></li>');

        }
        else{
          $('#prevList ul').append('<li class="list"><i class="fa fa-caret-square-o-right fa-3x pull-left"></i> <small>Lat.: <span class="list_latitude"><em>'+(cursor.value.latitude).toFixed(2)+'</em></span> &nbsp;&nbsp;&nbsp;<strong>Lon.: </strong><span class="list_longitude"><em>'+(cursor.value.longitude).toFixed(2)+'</em></span></small><br><strong>Note: </strong><span class="list_note">'+cursor.value.note+'</span></li>');

        }
        cursor.continue();
      }
    };
}