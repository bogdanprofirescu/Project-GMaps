
var map;
var mapBounds;
var mapBoundsReset;
var infowindow;
var detailedInfoWindow;
var newCenter;
var newCenter;
var clickImageLinkTracker=false;
function googleLoadError()
{
  alert("Google map is not loading. Try to refresh the page later.");
}

function viewModel() {
    var self = this;

    self.markersSet = ko.observableArray();
    self.placesSet = ko.observableArray();
    self.filtered_places_set = ko.observableArray();
    self.destination = ko.observable('New York');
    self.typeOfPlaceSelected = ko.observable();
    self.range = ko.observable(5000);
    self.filterSelected = ko.observable('all');

    var navigationBar = document.getElementById("navigationBar");
    var start_btn_background = document.getElementById("start_btn_background");

    //open and close menu functions hide/show the side-menu
    openMenu = function() {
        start_btn_background.style.display = "none";
        navigationBar.style.width = "160px";
        navigationBar.style.display = "";
        navigationBar.style.padding = "10px";
    }

    closeMenu = function() {
        start_btn_background.style.display = "block";
        navigationBar.style.width = "0";
        navigationBar.style.padding = "0";
    }


    findNewCenter = function() {
            eraseMarkers();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
                address: self.destination()
            },
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) setTimeout(findPlacesNearNewCenter(results[0].geometry.location, self.typeOfPlaceSelected(), self.range()), 2500)
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
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                mapBounds = mapBoundsReset;

                for (var i = 0; i < results.length; i++) {
                    var newPlaceToMark = {
                        title: results[i].name,
                        location: {
                            lat: results[i].geometry.location.lat(),
                            lng: results[i].geometry.location.lng()
                        }
                    };

                    createListItem(results[i].place_id, newPlaceToMark, i);
                }


                TransitionToNewLocation(newCenter);
            } else {
                if (results.length == 0) {
                    alert("Sorry, no place identified. Try to modify range and/or city");
                    // TREBUIE UN MODAL AICI
                }
                console.log("#places identified:", results.length);
            }
        }
    }

    function TransitionToNewLocation(newCenter) {

        // // map.setCenter(newCenter);
        // map.fitBounds(mapBounds);
        map.fitBounds(mapBounds);
        map.panToBounds(mapBounds);
        map.setZoom(10);
    }


    function createListItem(placeID, newPlaceToMark, i) {
        // var param=i;
        var string;
        var service = new google.maps.places.PlacesService(map);

        // https://developers.google.com/maps/documentation/javascript/examples/place-details

        service.getDetails({
            placeId: placeID
        }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var temp = place;
                try {

                    temp.srcURL = place.photos[0].getUrl({
                        'maxWidth': 80,
                        'maxHeight': 92
                    });

                } catch (e) {
                    console.log('no picture for:', place.name);
                    temp.srcURL = 'placeholder.png';
                }

                if (place.hasOwnProperty('rating')) {
                    temp.ratingStars = createRatingForPlace(place);
                    temp.ratingFigure = temp.rating;
                } else {
                    console.log(place.name," has no rating property");
                    temp.ratingStars = 'not';
                    temp.ratingFigure = 'rated yet';
                }

                self.placesSet.push(temp);
              //add  places in the filtered list after each new search by considering the filter value
                var place_added = false;
                switch (true) {
                    case (self.filterSelected() == 'all'):
                        self.filtered_places_set.push(temp);
                        place_added = true;
                        break;
                    case (self.filterSelected() == Math.round(temp.rating)):
                        self.filtered_places_set.push(temp);
                        place_added = true;
                        break;
                    case ((self.filterSelected() == 0) && (temp.ratingStars == 'not')):
                        self.filtered_places_set.push(temp);
                        place_added = true;
                        break;
                }
                createMarker(newPlaceToMark, i, place_added);
            } else {
                console.log(status);
            }

        });


    }

    function createRatingForPlace(placeToRate) {
        var ratingString;
        //"&#9733;" - black star , "&#9734;" - white star
        switch (true) {
            case ((Math.round(placeToRate.rating) == 1) && (placeToRate.rating < 1.25)):
                ratingString = "&#9733;";
                break;
            case ((Math.round(placeToRate.rating) == 1) && (placeToRate.rating > 1.25)):
                ratingString = "&#9733;" + "&#9734;";
                break;

            case ((Math.round(placeToRate.rating) == 2) && (placeToRate.rating < 2.25)):
                ratingString = "&#9733;" + "&#9733;";
                break;
            case ((Math.round(placeToRate.rating) == 2) && (placeToRate.rating > 2.25)):
                ratingString = "&#9733;" + "&#9733;" + "&#9734;";
                break;

            case ((Math.round(placeToRate.rating) == 3) && (placeToRate.rating < 3.25)):
                ratingString = "&#9733;" + "&#9733;" + "&#9733;";
                break;
            case ((Math.round(placeToRate.rating) == 3) && (placeToRate.rating > 3.25)):
                ratingString = "&#9733;" + "&#9733;" + "&#9733;" + "&#9734;";
                break;

            case ((Math.round(placeToRate.rating) == 4) && (placeToRate.rating < 4.25)):
                ratingString = "&#9733;" + "&#9733;" + "&#9733;" + "&#9733;";
                break;
            case ((Math.round(placeToRate.rating) == 4) && (placeToRate.rating > 4.25)):
                ratingString = "&#9733;" + "&#9733;" + "&#9733;" + "&#9733;" + "&#9734;";
                break;

            case ((Math.round(placeToRate.rating) == 5) && (placeToRate.rating < 4.74)):
                ratingString = "&#9733;" + "&#9733;" + "&#9733;" + "&#9733;" + "&#9734;";
                break;
            case ((Math.round(placeToRate.rating) == 5) && (placeToRate.rating > 4.75)):
                ratingString = "&#9733;" + "&#9733;" + "&#9733;" + "&#9733;" + "&#9733;";
                break;

        }

        return ratingString;
    }

    //this function applies the selected filter by updating the filtered_places_set array
    self.filterSelected.subscribe(function(newValue) {
          //do not try to filter if "all" option is reselected and all elements in list are already present
          if ((newValue == 'all') && (self.placesSet().length != self.filtered_places_set().length)) {
            console.log('copy all places back in filter list');
            console.log('places length:', self.placesSet().length);
            console.log('filtered places length', self.filtered_places_set().lenght);
            for (var i = 0; i < self.placesSet().length; i++) {
              self.filtered_places_set.push(self.placesSet()[i]);
              self.markersSet()[i].setMap(map);
            };
          };
          //filter if any other option than all is selected
          if (newValue != 'all') {
            console.log('checking values for stars!=all');

            self.filtered_places_set.removeAll();
            console.log('filtered_places_set length:', self.filtered_places_set().length);
            // console.log('new filtered array:', self.filtered_places_set());

            for (var j = 0; j < self.markersSet().length; j++) self.markersSet()[j].setMap(null);

            console.log("length of places_set is:", self.placesSet().length);
            for (var i = 0; i < self.placesSet().length; i++) {
              // console.log("entering switch, for place:",i);
              switch (true) {
                case ((Math.round(self.placesSet()[i].rating) == newValue)):
                {
                  // console.log(self.placesSet()[i].name," rating is ",self.placesSet()[i].rating);
                  self.filtered_places_set.push(self.placesSet()[i]);
                  self.markersSet()[i].setMap(map);
                };
                break;
                case ((!(self.placesSet()[i].hasOwnProperty('rating'))) && (newValue == 0)):
                {
                  console.log(self.placesSet()[i].name, " rating is ", self.placesSet()[i].rating);
                  self.filtered_places_set.push(self.placesSet()[i]);
                  self.markersSet()[i].setMap(map);
                };
                break;
              }
            }
          };
    });


    // how to identify the index of an object in an array depending on its property value
    // http://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array

    highlightMarker = function() {
        var object_id = this.id;
        var index = self.placesSet().map(function(e) {
            return e.id;
        }).indexOf(object_id);
        google.maps.event.trigger(self.markersSet()[index], 'mouseover');

    };

    unHighlightMarker = function() {
        var object_id = this.id;
        var index = self.placesSet().map(function(e) {
            return e.id;
        }).indexOf(object_id);
          google.maps.event.trigger(self.markersSet()[index], 'mouseout');
    };

    clickSideImage = function() {
//  clickImageLinkTracker  avoids the bubbling of the click event, without it a click on image link trigger also a click on image
      if (clickImageLinkTracker!=true) {
        var object_id = this.id;
        var index = self.placesSet().map(function(e) {
            return e.id;
        }).indexOf(object_id);
        var marker_location = self.placesSet()[index].geometry.location;
        // http://stackoverflow.com/questions/6100514/google-maps-v3-check-if-marker-is-present-on-map
        if (map.getBounds().contains(marker_location) == false) map.panTo(marker_location);
        animateMarker(index);
        // http://stackoverflow.com/questions/2730929/how-to-trigger-the-onclick-event-of-a-marker-on-a-google-maps-v3
        google.maps.event.trigger(self.markersSet()[index], 'click');
              };
              clickImageLinkTracker=false;
    }

    clickImageLink = function() {
  //  clickImageLinkTracker  avoids the bubbling of the click event, without it a click on image link trigger also a click on image
      clickImageLinkTracker=true;
        var object_id = this.id;
        var index = self.placesSet().map(function(e) {
            return e.id;
        }).indexOf(object_id);
        var marker_location = self.placesSet()[index].geometry.location;
        // http://stackoverflow.com/questions/6100514/google-maps-v3-check-if-marker-is-present-on-map
        if (map.getBounds().contains(marker_location) == false) map.panTo(marker_location);
        infowindow.close();
        if (detailedInfoWindow != undefined) detailedInfoWindow.close();
        detailedInfoWindow = popupCenter(this.url, this.name, 800, 550);
    }

    popupCenter = function(url, title, w, h) {
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }

    function createMarker(place, i, mapTrue) {
        var markerVisible;
        if (mapTrue == true) markerVisible = map;
        else markerVisible = null;
        var defaultIcon = makeMarkerIcon('0091ff');
        var marker = new google.maps.Marker({
            map: markerVisible,
            title: place.title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i,
            position: {
                lat: place.location.lat,
                lng: place.location.lng
            }
        });

        self.markersSet.push(marker); //add markers to the set
        mapBounds.extend(marker.position);
        map.fitBounds(mapBounds);

        google.maps.event.addListener(marker, 'click', function() {
            this.setIcon(makeMarkerIcon('f27b1f'));

            var object_id = marker.id;
            var index = self.markersSet().map(function(e) {
                return e.id;
            }).indexOf(object_id);
            animateMarker(index);

            getWiki(this, infowindow);
        });

        google.maps.event.addListener(marker, 'mouseover', function() {
            this.setIcon(makeMarkerIcon('f27b1f'));
        });

        google.maps.event.addListener(marker, 'mouseout', function() {
            this.setIcon(makeMarkerIcon('0091ff'));
        });

    }

    function animateMarker(i) {
        self.markersSet()[i].icon = makeMarkerIcon('f27b1f');
        for (var j = 0; j < 5; j++) {
            self.markersSet()[i].setAnimation(google.maps.Animation.BOUNCE);
            stopAnimation(self.markersSet()[i]);
        };

        function stopAnimation(marker) {
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1500);
        };

        setTimeout(function() {
            self.markersSet()[i].setIcon(makeMarkerIcon('0091ff'));
        }, 6000);
    }


    function eraseMarkers() {
        for (var i = 0; i < self.markersSet().length; i++) self.markersSet()[i].setMap(null);
        self.markersSet.removeAll();
        self.filtered_places_set.removeAll();
        self.placesSet.removeAll();
    }




    function makeMarkerIcon(markerColor) {
            var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    };

    function getWiki(marker, infowindow) {
            var markerWikiLink = "Wikipedia access was not possible. Please try again later .";
            var markerWikiLinkName = "There are no Wikipedia articles for this place";
            var htmlInfo = "";
            var maxNoOfArticles;

            var wikiRequestTimeout = setTimeout(function() {
                console.log("Failed to load Wikipedia resources..");
                populateInfoWindow(marker, infowindow, markerWikiLink);
            }, 2000);

            var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json';

            $.ajax(wikiURL, {
                dataType: "jsonp"
            }).done(function(response) {

                markerWikiLinkName = response[1];
                markerWikiLink = response[3];
                if (markerWikiLinkName.length > 3) maxNoOfArticles = 3;
                else maxNoOfArticles = markerWikiLinkName.length;
                // console.log("#of articles:", markerWikiLinkName.length);
                // console.log("max no of articles: ", maxNoOfArticles);
                if (markerWikiLinkName.length != 0)
                    for (var i = 0; i < maxNoOfArticles; i++) {
                            htmlInfo += '<p><a class="popup" href="' + markerWikiLink[i] + '" target="_blank">' + markerWikiLinkName[i] + '</a></p>';
                    } else htmlInfo = "<br>sorry, no wikipedia info available for this place.";

                clearTimeout(wikiRequestTimeout);
                populateInfoWindow(marker, infowindow, htmlInfo);
            });

        }


    function populateInfoWindow(marker, infowindow, htmlWikiInfo) {

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
                        infowindow.setContent("<div>" + marker.title + "</div><div id=\"pano\"></div>" +"<div>"+'<strong><a href="https://en.wikipedia.org/wiki/Main_Page">Wikipedia links:</a></strong>'+"</div>"+ "<div>" + htmlWikiInfo + "</div>");
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
                        infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
                    }
                }
                // Use streetview service to get the closest streetview image within
                // 50 meters of the markers position
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            //  console.log(infowindow);
            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
        }
    }

    findNewCenter();
}

function initMap() {
    // console.log("entered initmap");
    if (typeof google === 'undefined') alert("google api not loaded");

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
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
    mapBoundsReset = new google.maps.LatLngBounds();
    infowindow = new google.maps.InfoWindow();
    ko.applyBindings(new viewModel());
};
