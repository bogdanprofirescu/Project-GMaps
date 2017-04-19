
function viewModel()
{

// var divSideNavPlaces = document.getElementById('places');
var map;
var self = this;

self.markers_set=ko.observableArray();
self.places_set=ko.observableArray();
self.filtered_places_set=ko.observableArray();

self.destination=ko.observable('Brasov');
self.typeOfPlaceSelected=ko.observable();
self.range=ko.observable(5000);
self.filterSelected=ko.observable('all');

var infowindow, detailedInfoWindow, newCenter;
var mapBounds;

var navigationBar=document.getElementById("navigationBar");
var start_btn_background=document.getElementById("start_btn_background");

//open and close menu functions hide/show the side-menu
openMenu=function() {
  start_btn_background.style.display="none";
  navigationBar.style.width = "160px";
  navigationBar.style.display="";
  navigationBar.style.padding= "10px";
}

closeMenu=function() {
  start_btn_background.style.display="block";
  navigationBar.style.width = "0";
  navigationBar.style.padding= "0";
}

function initMap()
{
//TODO - se poate adauga styles pentru harta, ca in maps2
if (typeof google === 'undefined') alert("google api not loaded");
// TO DO error handling to be improved,
//as google object exists even without internet access
//onerror function does not work

  map = new google.maps.Map(document.getElementById('map'), {
    // center: {lat: 45.642024, lng: 25.589116},
    zoom: 14,
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

  findNewCenter=function()
  {
    eraseMarkers();
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: self.destination()},
      function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) setTimeout (findPlacesNearNewCenter(results[0].geometry.location, self.typeOfPlaceSelected(),self.range()),2500)
                else
                  window.alert('We could not find that location, check for typos or enter another location.');
      });
    }


  function findPlacesNearNewCenter(newCenter, typeOfPlace, rangeValue) {
                var service = new google.maps.places.PlacesService(map);
        //nearbysearch will return a list of up to 20 places by default
        service.nearbySearch({
                                location: newCenter,
                                radius: rangeValue,
                                keyword: typeOfPlace,
                                type: 'establishment'
                              }, callback);

              function callback(results, status) {
                      if (status === google.maps.places.PlacesServiceStatus.OK)
                                   {
                                           mapBounds=mapBoundsReset;
                                            var maxPlaces;
                                            if (results.length>10) maxPlaces=10
                                                        else maxPlaces=results.length;
                                            for (var i = 0; i < maxPlaces; i++)
                                                    {
                                                        var newPlaceToMark={ title: results[i].name,
                                                                            location: {lat: results[i].geometry.location.lat(),
                                                                                      lng: results[i].geometry.location.lng()}
                                                                            };
                                                        // console.log("ask to create place no:",i);
                                                        createListItem(results[i].place_id, newPlaceToMark, i);

                                                    }
                                           TransitionToNewLocation(newCenter);
                                        }
                                else {
                                  if (results.length==0) {
                                    alert("Sorry, no place identified. Try to modify range and/or city");
                                    // TREBUIE UN MODAL AICI
                                  }
                                  console.log("#places identified:",results.length);
                                      }
                                  }
      }

      function TransitionToNewLocation(newCenter) {
        // console.log("new center translation");
              map.setCenter(newCenter);
              map.fitBounds(mapBounds);
              map.setZoom(12);
              map.panTo(newCenter);
              // map.fitBounds(mapBounds);
              // only in this succesion I manage to center the map at the right zoom
              // console.log("zoom after new center:", map.getZoom());
      }


    function createListItem(placeID,newPlaceToMark,i)
    {
            // var param=i;
            var string;
            var service = new google.maps.places.PlacesService(map);

              // https://developers.google.com/maps/documentation/javascript/examples/place-details

              service.getDetails({
                           placeId: placeID
                          }, function(place, status) {
                           if (status === google.maps.places.PlacesServiceStatus.OK) {
                                      var temp=place;
                                      try {
                                            // place.photos[0].getUrl({'maxWidth': 80, 'maxHeight': 92});
                                            temp.srcURL=place.photos[0].getUrl({'maxWidth': 80, 'maxHeight': 92});
                                            // console.log(place);
                                    }
                                    catch (e) {
                                      console.log('no picture for:', place.name);
                                      // console.log(place);
                                      temp.srcURL='placeholder.png';
                                    }

                                    if (place.hasOwnProperty('rating'))
                                                                      {
                                                                        //  console.log(place.rating);
                                                                        temp.ratingFigure=temp.rating;
                                                                        temp.ratingStars=createRatingForPlace(place);
                                                                      }
                                              else {
                                                        // console.log(place.name," has no rating property");
                                                        temp.ratingStars ='not';
                                                        temp.ratingFigure ='rated yet';
                                                      }


                                      self.places_set.push(temp);
                                      self.filtered_places_set.push(temp);
                                      createMarker(newPlaceToMark,i);
                                                              }
                                                              else {
                                                                console.log(status);
                                                              }

                                    });


    }

function createRatingForPlace(placeToRate)
{
  var ratingString;
  //"&#9733;" - black star , "&#9734;" - white star
  switch(true) {
    case ((Math.round(placeToRate.rating)==1)&&(placeToRate.rating<1.25)): ratingString="&#9733;"; break;
    case ((Math.round(placeToRate.rating)==1)&&(placeToRate.rating>1.25)): ratingString="&#9733;"+"&#9734;"; break;

    case ((Math.round(placeToRate.rating)==2)&&(placeToRate.rating<2.25)): ratingString="&#9733;"+"&#9733;"; break;
    case ((Math.round(placeToRate.rating)==2)&&(placeToRate.rating>2.25)): ratingString="&#9733;"+"&#9733;"+"&#9734;"; break;

    case ((Math.round(placeToRate.rating)==3)&&(placeToRate.rating<3.25)): ratingString="&#9733;"+"&#9733;"+"&#9733;"; break;
    case ((Math.round(placeToRate.rating)==3)&&(placeToRate.rating>3.25)): ratingString="&#9733;"+"&#9733;"+"&#9733;"+"&#9734;"; break;

    case ((Math.round(placeToRate.rating)==4)&&(placeToRate.rating<4.25)): ratingString="&#9733;"+"&#9733;"+"&#9733;"+"&#9733;"; break;
    case ((Math.round(placeToRate.rating)==4)&&(placeToRate.rating>4.25)): ratingString="&#9733;"+"&#9733;"+"&#9733;"+"&#9733;"+"&#9734;";  break;

    case ((Math.round(placeToRate.rating)==5)&&(placeToRate.rating<4.74)): ratingString="&#9733;"+"&#9733;"+"&#9733;"+"&#9733;"+"&#9734;";  break;
    case ((Math.round(placeToRate.rating)==5)&&(placeToRate.rating>4.75)): ratingString="&#9733;"+"&#9733;"+"&#9733;"+"&#9733;"+"&#9733;"; break;

  }

return ratingString;
}

self.filterSelected.subscribe(function(newValue){
  filterList(newValue);
});

function filterList(stars)
{
  console.log("new value is:",stars);

  if ((stars==='all') && (self.places_set().length != self.filtered_places_set().lenght))
                      { console.log('copy all places back in filter list');
                        for (var i=0; i<self.places_set().length;i++)
                                   { self.filtered_places_set.push(self.places_set()[i]);
                                     self.markers_set()[i].setMap(map);
                                   };
                      };

    if (stars!='all')
          { self.filtered_places_set.removeAll();
            for (var i=0; i<self.places_set().length;i++)
                        { self.markers_set()[i].setMap(map);
                          if (self.places_set()[i].hasOwnProperty('rating')) {
                                                  console.log(self.places_set()[i].name," rating is ",self.places_set()[i].rating);  
                                                if (Math.round(self.places_set()[i].rating)==stars)
                                                      {  console.log(self.places_set()[i].name);
                                                          self.filtered_places_set.push(self.places_set()[i]);
                                                      }
                                                      else self.markers_set()[i].setMap(null);
                                                    }
                        }
            };

  // self.filtered_places_set.removeAll();
  // for (var i=0; i<self.places_set().length;i++)
  //
  //           //  self.filtered_places_set.push(self.places_set()[i]);
  //
  //             // else { if (self.places_set()[i].hasOwnProperty('rating'))
  //             //             if (Math.round(self.places_set()[i].rating)==stars)
              //               {  console.log(self.places_set()[i].name);
              //                 self.filtered_places_set.push(self.places_set()[i]);
              //               }
              //     }


            // console.log(self.places_set()[i].rating);



  // self.filtered_places_set=ko.observableArray();
  //need to filter the markers as well
}

// how to identify the index of an obect in an array depending on its property value
// http://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array

  highlightMarker=function() {
          var object_id=this.id;
          var index=self.places_set().map(function(e) { return e.id; }).indexOf(object_id);
          // console.log("highlight marker");
          google.maps.event.trigger(self.markers_set()[index], 'mouseover');

        };

  unHighlightMarker=function() {
                var object_id=this.id;
                var index=self.places_set().map(function(e) { return e.id; }).indexOf(object_id);
                // console.log("UN_highlight marker");
                google.maps.event.trigger(self.markers_set()[index], 'mouseout');
              };

  clickSideImage=function() {
              var object_id=this.id;
              var index=self.places_set().map(function(e) { return e.id; }).indexOf(object_id);
              var marker_location=self.places_set()[index].geometry.location;
              // console.log(marker_location);
              // http://stackoverflow.com/questions/6100514/google-maps-v3-check-if-marker-is-present-on-map
              if (map.getBounds().contains(marker_location)==false) map.panTo(marker_location);
              animateMarker(index);
              // console.log("clickSideImage");
}

dblclickSideImage=function(){
  var object_id=this.id;
  var index=self.places_set().map(function(e) { return e.id; }).indexOf(object_id);
  var marker_location=self.places_set()[index].geometry.location;
  // http://stackoverflow.com/questions/6100514/google-maps-v3-check-if-marker-is-present-on-map
  if (map.getBounds().contains(marker_location)==false) map.panTo(marker_location);
  infowindow.close();
  // console.log("dblclickSideImage");
  if (detailedInfoWindow!=undefined) detailedInfoWindow.close();
    detailedInfoWindow=popupCenter(this.url,this.name,800,550);
}

function popupCenter(url, title, w, h) {
        //trebuie pus un modal
        var left = (screen.width/2)-(w/2);
        var top = (screen.height/2)-(h/2);
        // window.close();
      return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
        }




        function animateMarker(i)
        {
          self.markers_set()[i].icon=makeMarkerIcon('f27b1f');
          for (var j = 0; j < 5; j++)
                      { self.markers_set()[i].setAnimation(google.maps.Animation.BOUNCE);
                        stopAnimation(self.markers_set()[i]);
                          };
          function stopAnimation(marker) {
                      setTimeout(function () { marker.setAnimation(null); }, 1500); };

                      setTimeout(function () {  self.markers_set()[i].setIcon(makeMarkerIcon('0091ff'));}, 6000);
        }


            function eraseMarkers()
            {
              for (var i=0; i<self.markers_set().length; i++) self.markers_set()[i].setMap(null);
              self.markers_set.removeAll();
              self.filtered_places_set.removeAll();
              self.places_set.removeAll();
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

                self.markers_set.push(marker);//add markers to the set
                mapBounds.extend(marker.position);
                map.fitBounds(mapBounds);
                google.maps.event.addListener(marker, 'click', function() {
                this.setIcon(makeMarkerIcon('f27b1f'));
                populateInfoWindow(this, infowindow);
              });

              google.maps.event.addListener(marker, 'mouseover', function() {
              this.setIcon(makeMarkerIcon('f27b1f'));
            });

            google.maps.event.addListener(marker, 'mouseout', function() {
            this.setIcon(makeMarkerIcon('0091ff'));
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
                      TransitionToNewLocation(marker.internalPosition);
                      // Check to make sure the infowindow is not already opened on this marker.
                      if (infowindow.marker != marker) {
                        infowindow.marker = marker;
                        infowindow.setContent('');
                        infowindow.open(map, marker);
                        // Make sure the marker property is cleared if the infowindow is closed.
                        infowindow.addListener('closeclick', function() {
                          infowindow.marker = null;
                          marker.setIcon(makeMarkerIcon('0091ff'));
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
initMap();
    }

ko.applyBindings(new viewModel());
