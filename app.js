// adding two event listeners for opening and closing the menu
document.getElementById("start_btn").addEventListener('click',openMenu,false);
document.getElementById("close_btn").addEventListener('click',closeMenu,false);

//adding few bindings so that changes can be done
// without repeated bindings in event handlers functions
var mySidenav=document.getElementById("mySidenav");
var main=document.getElementById("main");
var start_btn_background=document.getElementById("start_btn_background");
var sidenav_items=document.getElementsByClassName("sidenav")[0];

//open and close menu functions change the sidebar width & hide/show
// the main menu button
function openMenu() {
  // sidenav_items.style.display="none";
  start_btn_background.style.display="none";
  if (window.innerWidth<700) mySidenav.style.width = "160px";
      else mySidenav.style.width = "235px";
  sidenav_items.style.display="";
  }

function closeMenu() {
  start_btn_background.style.display="";
  // sidenav_items.style.display="none";
    mySidenav.style.width = "0";
}

var map;
var markers_set=[];

function initMap()
{
//TODO - se poate adauga styles pentru harta, ca in maps2
if (typeof google === 'undefined') alert("google api not loaded");
// TO DO error handling to be improved,
//as google object exists even without internet access
//onerror function does not work

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.642024, lng: 25.589116},
    zoom: 13,
      mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_CENTER
          },
          zoomControl: true,
          zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER
          },
          scaleControl: true,
          streetViewControl: false,
          fullscreenControl: true
  });


// adding locations
//TODO - should we try to load markers from a text file via an iFrame?
//creating the markers and storing them in a markers array

var points_of_interest=[
  {title:'Piata Sfatului', location:{lat: 45.642024, lng: 25.589116}},
  {title:'Black Church', location:{lat:45.640879, lng:25.587810}},
  {title:'Bran Castle', location:{lat:45.514902, lng:25.367159}},
  {title:'Poiana Brasov', location:{lat:45.595337,lng: 25.552903}},
  {title:'Cantacuzino Castle', location:{lat:45.414050,lng:25.542612}},
  {title: 'Peles Castle', location:{lat:45.359984, lng: 25.542644}},
  {title: 'Seven Ladders Canyon', location:{lat:45.566535, lng:25.644098}},
  {title: 'Brasovia Citadel',location:{lat:45.649319,lng:25.591889}},
  {title:'Rasnov Fortress', location:{lat:45.590236,lng:25.469437}}
];

var bounds = new google.maps.LatLngBounds();
var largeInfowindow = new google.maps.InfoWindow();

for (var i=0;i<points_of_interest.length;i++)
  {
    var marker_location=points_of_interest[i].location;
    var marker_title=points_of_interest[i].title;
    var marker = new google.maps.Marker({
          position: marker_location,
          title: marker_title,
          animation: google.maps.Animation.DROP,
          // icon: defaultIcon,
          id: i
        });
    markers_set.push(marker);
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    markers_set[i].setMap(map);
    bounds.extend(markers_set[i].position);
  }
  map.fitBounds(bounds);
};

// ----END OF INITMAP FUNCTION----


function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;

          // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
            function getStreetView(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                  var nearStreetViewLocation = data.location.latLng;
                  var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                  infowindow.setContent("<div>" + marker.title + "</div><div id=\"pano\"></div>");

                  var panoramaOptions = {
                    position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
                var panorama = new google.maps.StreetViewPanorama(
                  document.getElementById('pano'), panoramaOptions);
                } else {
                  infowindow.setContent('<div>' + marker.title + '</div>' +'<div>No Street View Found</div>');
                }
              }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
        }
      }
