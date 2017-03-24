// adding two event listeners for opening and closing the menu
document.getElementById("start_btn").addEventListener('click',openMenu,false);
document.getElementById("close_btn").addEventListener('click',closeMenu,false);

//this function is a candidate for knockout.js
window.onload= function() {
// document.getElementById("areaChoice").addEventListener('change', findNewCenter);
// document.getElementById("typeOfPlace").addEventListener('change', findNewCenter);
document.getElementById("searchBttn").addEventListener('click', findNewCenter);
};


//adding few bindings so that changes can be done
// without repeated bindings in event handlers functions
var navigationBar=document.getElementById("navigationBar");
var main=document.getElementById("main");
var start_btn_background=document.getElementById("start_btn_background");
var sidenav_items=document.getElementsByClassName("sidenav")[0];
var divSideNavPlaces = document.getElementById('places');

//open and close menu functions change the sidebar width & hide/show
// the main menu button
function openMenu() {
  sidenav_items.style.display="none";
  start_btn_background.style.display="none";
  if (window.innerWidth<700) navigationBar.style.width = "160px";
      else navigationBar.style.width = "235px";
  sidenav_items.style.display="";
  navigationBar.style.padding= "3px";
  }

function closeMenu() {
  start_btn_background.style.display="";
  // sidenav_items.style.display="none";
    navigationBar.style.width = "0";
    navigationBar.style.padding= "0";
}

var map;
var markers_set=[];


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
      }

      function findPlacesNearNewCenter(newCenter,typeOfPlaceSelected,rangeValue) {
        console.log(rangeValue);
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
                                    console.log(results.length);
                                    eraseMarkers();
                                    clearList();
                                    mapBounds=mapBoundsReset;
                                    for (var i = 0; i < results.length; i++)
                                            {
                                                var newPlaceToMark={ title: results[i].name,
                                                                    location: {lat: results[i].geometry.location.lat(),
                                                                              lng: results[i].geometry.location.lng()}
                                                                    };
                                                console.log(results[i].reference);
                                                // createListItem(newPlaceToMark);
                                                createListItem(results[i].reference);
                                                createMarker(newPlaceToMark,i);
                                            }
                                TransitionToNewLocation(newCenter);
                                }
                          }
      }

      function TransitionToNewLocation(newCenter) {
              map.setCenter(newCenter);
              map.fitBounds(mapBounds);
              map.setZoom(12);
              map.panTo(newCenter);
              // only in this succesion I manage to center the map at the right zoom
              console.log("zoom after new center:", map.getZoom());
      }

      function clearList()
      {
          console.log("clear list called..");
          divSideNavPlaces.innerHTML="";
      }

          function createListItem(listItem)
          {

            //  https://developers.google.com/places/web-service/photos
              var string;
              //old streetview version
                // string='<div class="placeDiv"><p class="placeName">'+listItem.title+'</p>'+
                //         '<img src=' +'"'+'http://maps.googleapis.com/maps/api/streetview?location='+
                //                   listItem.location.lat+','+
                //                   listItem.location.lng+'&size=80x92'+
                //                   '&key=AIzaSyARDaZozs7u65RbsBI4Xjwx7jJJ87iUAjY'+
                //                   '"></div>';

                // string='<div class="placeDiv"><p class="placeName">'+listItem.title+'</p>'+
                //         '<img src=' +'"'+'https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference='+
                //                     listItem+
                //                   '&key=AIzaSyARDaZozs7u65RbsBI4Xjwx7jJJ87iUAjY'+
                //                   '"></div>';
            string='https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference='+ listItem +'&key=AIzaSyARDaZozs7u65RbsBI4Xjwx7jJJ87iUAjY';
            console.log(string);
            string="https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=CnRtAAAATLZNl354RwP_9UKbQ_5Psy40texXePv4oAlgP4qNEkdIrkyse7rPXYGd9D_Uj1rVsQdWT4oRz4QrYAJNpFX7rzqqMlZw2h2E2y5IKMUZ7ouD_SlcHxYq1yL4KbKUv3qtWgTK0A6QbGh87GB3sscrHRIQiG2RrmU_jF4tENr9wGS_YxoUSSDrYjWmrNfeEHSGSc3FyhNLlBU&key="
            string=string+'AIzaSyARDaZozs7u65RbsBI4Xjwx7jJJ87iUAjY'
            // var photo = place.photos[0].getUrl(string);
            // console.log(photo);
            // divSideNavPlaces.innerHTML = divSideNavPlaces.innerHTML + string;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', string, true);
            xhr.send();
            xhr.addEventListener("readystatechange", processRequest, false);
            xhr.onreadystatechange = processRequest;

            function processRequest(e) {
              if (xhr.readyState == 4 && xhr.status == 200) {
                       console.log(xhr.responseText);
                  }
            }


          }



            function eraseMarkers()
            {
              console.log('#markers_length:', markers_set.length);
              var array_size=markers_set.length;
              for (var i=0; i<markers_set.length; i++) markers_set[i].setMap(null);
              markers_set.splice(0,array_size);
              console.log('#markers_new length:', markers_set.length);
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
