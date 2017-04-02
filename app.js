// adding two event listeners for opening and closing the menu
document.getElementById("start_btn").addEventListener('click',openMenu,false);
document.getElementById("close_btn").addEventListener('click',closeMenu,false);

//this function is a candidate for knockout.js
window.onload= function() {
document.getElementById("searchBttn").addEventListener('click', findNewCenter);
};


//adding few bindings so that changes can be done
// without repeated bindings in event handlers functions
var navigationBar=document.getElementById("navigationBar");
var main=document.getElementById("main");
var start_btn_background=document.getElementById("start_btn_background");
var sidenav_items=document.getElementsByClassName("sidenav")[0];
var divSideNavPlaces = document.getElementById('places');
var globalTempMarker;
//open and close menu functions change the sidebar width & hide/show
// the main menu button
function openMenu() {
  sidenav_items.style.display="none";
  start_btn_background.style.display="none";
  // if (window.innerWidth<700) navigationBar.style.width = "160px";
  //     else navigationBar.style.width = "235px";
  navigationBar.style.width = "160px";
  sidenav_items.style.display="";
  navigationBar.style.padding= "10px";
  }

function closeMenu() {
    start_btn_background.style.display="block";
  // sidenav_items.style.display="none";
    navigationBar.style.width = "0";
    navigationBar.style.padding= "0";
}

var map;
var markers_set=[];
var places_set=[];
var events_set=[];


var infowindow;
var newCenter;
var destination=document.getElementById("areaChoice");
var typeOfPlaceSelected=document.getElementById("typeOfPlace");
var range=document.getElementById("range");
var mapBounds;

function initMap()
{
//TODO - se poate adauga styles pentru harta, ca in maps2
if (typeof google === 'undefined') alert("google api not loaded");
// TO DO error handling to be improved,
//as google object exists even without internet access
//onerror function does not work

  map = new google.maps.Map(document.getElementById('map'), {
    // center: {lat: 45.642024, lng: 25.589116},
    zoom: 12,
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
  mapBoundsReset= new google.maps.LatLngBounds();
  infowindow= new google.maps.InfoWindow();
  findNewCenter();
  };




  function findNewCenter()
      {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { address: destination.value},
           function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                     {
                      //  map.setCenter(results[0].geometry.location);
                       findPlacesNearNewCenter(results[0].geometry.location, typeOfPlaceSelected.value,range.value);
                            };
            }
                   else {
                    window.alert('We could not find that location - try entering a more' +
                        ' specific place.');
                  }
          });

          setTimeout(addEventsListeners,2500);

      }

      function findPlacesNearNewCenter(newCenter,typeOfPlaceSelected,rangeValue) {

        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
                                location: newCenter,
                                radius: rangeValue,
                                keyword: typeOfPlaceSelected,
                                type: 'establishment'
                              }, callback);

              function callback(results, status) {
                      if (status === google.maps.places.PlacesServiceStatus.OK)
                                   {
                                            // console.log(results.length);
                                            eraseMarkers();
                                            clearList();
                                            mapBounds=mapBoundsReset;
                                            for (var i = 0; i < results.length; i++)
                                                    {
                                                        var newPlaceToMark={ title: results[i].name,
                                                                            location: {lat: results[i].geometry.location.lat(),
                                                                                      lng: results[i].geometry.location.lng()}
                                                                            };
                                                        // console.log("ask to create place no:",i);
                                                        createListItem(results[i].place_id, newPlaceToMark, i);
                                                        createMarker(newPlaceToMark,i);
                                                    }
                                           TransitionToNewLocation(newCenter);
                                        }
                                  }


      }

      function TransitionToNewLocation(newCenter) {
        console.log("new center translation");
              map.setCenter(newCenter);
              map.fitBounds(mapBounds);
              map.setZoom(12);
              map.panTo(newCenter);
              // only in this succesion I manage to center the map at the right zoom
              // console.log("zoom after new center:", map.getZoom());
      }

      function clearList()
      {
          // console.log("clear list called..");
          divSideNavPlaces.innerHTML="";
      }

    function createListItem(placeID,newPlaceToMark,i)
          {
            var param=i;
              // console.log("creating div no:",i);
              var string;
              var service = new google.maps.places.PlacesService(map);

              // https://developers.google.com/maps/documentation/javascript/examples/place-details

              service.getDetails({
                           placeId: placeID
                          }, function(place, status) {
                           if (status === google.maps.places.PlacesServiceStatus.OK) {


                                         string='<div class="placeNameAndImage" title="Click to highlight marker on map \nDoubleclick for detailed info" id="'+placeID+'"><p class="placeName">'+ place.name+'</p>'+
                                                  '<img src='
                                                   + place.photos[0].getUrl({'maxWidth': 80, 'maxHeight': 92})+'"> </div><hr>';
                                         divSideNavPlaces.innerHTML = divSideNavPlaces.innerHTML + string;
                                         //e posibil sa nu existe poza - pt asta trebuie prinsa o eroare aici
                                        places_set.push(place);
                                        console.log(places_set.length);
                                                              }
                                    });

        }

        function addEventsListeners()
        {
          console.log('adding events listeners...');
          console.log(places_set.length);

          for (var i=0;i<places_set.length;i++)
          {
            console.log(places_set[i].place_id);

            var place = document.getElementById(places_set[i].place_id);
            place.addEventListener('click', (function(place) {
              return function() {
                // alert(place.name);
                animateMarker(places_set.indexOf(place));

              };
            })(places_set[i]));



            place.addEventListener('dblclick', (function(place) {
              return function() {
                popupCenter(place.url,place.name,800,550);
                // window.open(place.url, "popupWindow", "width=650,height=350,scrollbars=yes");
                        };
            })(places_set[i]));
          }

        }

        function popupCenter(url, title, w, h) {
        var left = (screen.width/2)-(w/2);
        var top = (screen.height/2)-(h/2);
        return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
        }




        function animateMarker(i)
        {
          markers_set[i].icon=makeMarkerIcon('bf6c1c');
          for (var j = 0; j < 5; j++)
                      { markers_set[i].setAnimation(google.maps.Animation.BOUNCE);
                        stopAnimation(markers_set[i]);
                          };
          function stopAnimation(marker) {
                      setTimeout(function () { marker.setAnimation(null); }, 1500); };

          setTimeout(function () {  markers_set[i].icon=makeMarkerIcon('0091ff'); }, 3000);
        }






            function eraseMarkers()
            {
              //need to add erase palces set as well
              // console.log('#markers_length:', markers_set.length);
              var array_size=markers_set.length;
              var places_set_array_size=places_set.length;

              for (var i=0; i<markers_set.length; i++) markers_set[i].setMap(null);
              markers_set.splice(0,array_size);
              places_set.splice(0,places_set_array_size);
              // console.log('#markers_new length:', markers_set.length);
            }


            function createMarker(place,i) {
              var defaultIcon = makeMarkerIcon('0091ff');
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
                // map.fitBounds(mapBounds);
                google.maps.event.addListener(marker, 'click', function() {
                populateInfoWindow(this, infowindow);
              });
            }


            function makeMarkerIcon(markerColor) {
                // console.log("makeMarkerIcon called");
                var markerImage = new google.maps.MarkerImage(
                'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
                '|40|_|%E2%80%A2',
                new google.maps.Size(21, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34),
                new google.maps.Size(21,34));
                return markerImage;
              };
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
