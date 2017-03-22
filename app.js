// adding two event listeners for opening and closing the menu
document.getElementById("start_btn").addEventListener('click',openMenu,false);
document.getElementById("close_btn").addEventListener('click',closeMenu,false);

//this function is a candidate for knockout.js
window.onload= function() {
document.getElementById("areaChoice").addEventListener('change', focusChosenArea);
document.getElementById("typeOfPlace").addEventListener('change', focusChosenArea);
};


//adding few bindings so that changes can be done
// without repeated bindings in event handlers functions
var navigationBar=document.getElementById("navigationBar");
var main=document.getElementById("main");
var start_btn_background=document.getElementById("start_btn_background");
var sidenav_items=document.getElementsByClassName("sidenav")[0];

//open and close menu functions change the sidebar width & hide/show
// the main menu button
function openMenu() {
  sidenav_items.style.display="none";
  start_btn_background.style.display="none";
  if (window.innerWidth<700) navigationBar.style.width = "160px";
      else navigationBar.style.width = "235px";
  sidenav_items.style.display="";
  }

function closeMenu() {
  start_btn_background.style.display="";
  // sidenav_items.style.display="none";
    navigationBar.style.width = "0";
}

var map;
var markers_set=[];


var infowindow;
var newCenter;
var destination=document.getElementById("areaChoice");
var typeOfPlaceSelected=document.getElementById("typeOfPlace");
var mapBounds;


var points_of_interest=[
  {title:'Piata Sfatului', location:{lat: 45.642024, lng: 25.589116}},
  {title:'Black Church', location:{lat:45.640879, lng:25.587810}},
  {title:'Bran Castle', location:{lat:45.514902, lng:25.367159}},
  {title:'Poiana Brasov', location:{lat:45.595337,lng: 25.552903}},
  {title:'Cantacuzino Castle', location:{lat:45.414050,lng:25.542612}},
  {title: 'Peles Castle', location:{lat:45.359984, lng: 25.542644}},
  {title: 'Brasovia Citadel',location:{lat:45.649319,lng:25.591889}},
  {title:'Rasnov Fortress', location:{lat:45.590236,lng:25.469437}}
];

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
  mapBounds = new google.maps.LatLngBounds();
  infowindow= new google.maps.InfoWindow();
  addInitialMarkers();
// adding locations
//TODO - should we try to load markers from a text file via an iFrame?
//creating the markers and storing them in a markers array
};
// ----END OF INITMAP FUNCTION----
function addInitialMarkers()
{
  for (var i=0;i<points_of_interest.length;i++)
      {
        createMarker(points_of_interest[i],i);
        // console.log(typeof(points_of_interest[i]));

            }
}


// function addMarkers()
// {
//   var bounds = new google.maps.LatLngBounds();
//   // var largeInfowindow = new google.maps.InfoWindow();
//
//   for (var i=0;i<points_of_interest.length;i++)
//     {
//       var marker_location=points_of_interest[i].location;
//       var marker_title=points_of_interest[i].title;
//       var marker = new google.maps.Marker({
//             position: marker_location,
//             title: marker_title,
//             animation: google.maps.Animation.DROP,
//             // icon: defaultIcon,
//             id: i
//           });
//       markers_set.push(marker);
//       marker.addListener('click', function() {
//         populateInfoWindow(this, infowindow);
//       });
//       markers_set[i].setMap(map);
//       bounds.extend(markers_set[i].position);
//     }
//     map.fitBounds(bounds);
// }


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
                    pitch: 20
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


      function focusChosenArea()
      {

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { address: destination.value},
           function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                     {
                       map.setCenter(results[0].geometry.location);
                       findPlaces(results[0].geometry.location, typeOfPlaceSelected.value);
                            };
            }
             else {
              window.alert('We could not find that location - try entering a more' +
                  ' specific place.');
            }
          });
      }

      function findPlaces(newCenter,typeOfPlaceSelected) {
        console.log(newCenter);
        var service = new google.maps.places.PlacesService(map);

        if (typeOfPlaceSelected=='castle')
                        service.nearbySearch({
                                location: newCenter,
                                radius: 50000,
                                keyword: typeOfPlaceSelected,
                                type: 'establishment'
                              }, callback)

                      else   service.nearbySearch({
                              location: newCenter,
                              radius: 5000,
                              type: typeOfPlaceSelected
                            }, callback)

              function callback(results, status) {
              if (status === google.maps.places.PlacesServiceStatus.OK)
                           {
                                    console.log(results.length);
                                    eraseMarkers();
                                    for (var i = 0; i < results.length; i++)
                                            {
                                                var newPlaceToMark={title: results[i].name, location:{lat: results[i].geometry.location.lat(), lng: results[i].geometry.location.lng()}};
                                                // console.log(newPlaceToMark);
                                                // console.log(newPlaceToMark.location.lat);
                                                // console.log(newPlaceToMark.location.lng);
                                                // createMarker(results[i],i);
                                                createMarker(newPlaceToMark,i);
                                            }
                                }
                          }
      }
            function eraseMarkers()
            {
              console.log('#markers_set:', markers_set.length);
              var array_size=markers_set.length;
              for (var i=0; i<markers_set.length; i++) markers_set[i].setMap(null);
              markers_set.splice(0,array_size);

              console.log('#markers_set:', markers_set.length);
            }


            function createMarker(place,i) {
              var defaultIcon = makeMarkerIcon('0091ff');
              // console.log(typeof(place));
              // var placeLoc = {
              //   lat: place.geometry.location.lat(),
              //   lng: place.geometry.location.lng()
              // };
              // console.log(place.name);

              var marker = new google.maps.Marker({
                map: map,
                title: place.title,
                icon: defaultIcon,
                animation: google.maps.Animation.DROP,
                id: i,
                position: {lat: place.location.lat, lng: place.location.lng }
              });
                markers_set.push(marker);//add markers to the set
                mapBounds.extend(marker.position);
                map.fitBounds(mapBounds);
                // var newInfowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker, 'click', function() {
                // infowindow.setContent(place.name);
                // infowindow.open(map, this);
                populateInfoWindow(this, infowindow);
              });
            }


            function makeMarkerIcon(markerColor) {
                var markerImage = new google.maps.MarkerImage(
                'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
                '|40|_|%E2%80%A2',
                new google.maps.Size(21, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34),
                new google.maps.Size(21,34));
                return markerImage;
              };
