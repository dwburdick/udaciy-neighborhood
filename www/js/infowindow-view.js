$(function () {
	$("#map").css("height", $(window).height());
});

function initMap() {

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 39.706901, lng: -105.084055},
		zoom: 15
	});

	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.LEFT_TOP].push(input);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
	searchBox.setBounds(map.getBounds());
	});

	var markers = [];
	// [START region_getplaces]
	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
	var places = searchBox.getPlaces();

	if (places.length == 0) {
	  return;
	}

	// Clear out the old markers.
	markers.forEach(function(marker) {
	  marker.setMap(null);
	});
	markers = [];

	// For each place, get the icon, name and location.
	var bounds = new google.maps.LatLngBounds();
	places.forEach(function(place) {
	  var icon = {
	    url: place.icon,
	    size: new google.maps.Size(71, 71),
	    origin: new google.maps.Point(0, 0),
	    anchor: new google.maps.Point(17, 34),
	    scaledSize: new google.maps.Size(25, 25)
	  };

	  // Create a marker for each place.
	  markers.push(new google.maps.Marker({
	    map: map,
	    icon: icon,
	    title: place.name,
	    position: place.geometry.location
	  }));

	  if (place.geometry.viewport) {
	    // Only geocodes have viewport.
	    bounds.union(place.geometry.viewport);
	  } else {
	    bounds.extend(place.geometry.location);
	  }
	});
	map.fitBounds(bounds);
	});
	// [END region_getplaces]

	addMarkers(Model.masterList);
};

var Model = {
	init: function() {
		Model.getDate();
		Model.getMovies();
		$(document).ready(function(){
			$("#listToggle").click(function(){
				$("#movieList").toggle();
			});
			window.setTimeout(Model.loadMoviesArray, 900);
		});
	},
	loadMoviesArray: function(){
		for (i in movies.responseJSON) {
		viewModel.movies.push(movies.responseJSON[i].title);
		};
	},
	getDate: function() {
		var today = new Date();
		var yyyy = today.getFullYear();
		var mm = today.getMonth() + 1;
		var dd = today.getDate();
		date = yyyy + "-" + mm + "-"+ dd;
	},
	getMovies: function() {
		movies = $.ajax("http://daBROKENTEMPORARILYta.tmsapi.com/v1.1/movies/showings?startDate=" +
			date + "&numDays=1&lat=39.708582&lng=-105.076251%radius=1&units=mi&api_key=5p8sgppbuvrcwt9h6szyjy3u", {
				error: function(){
					$showtimes.append("<br>There was a problem getting a list of films.<br> Visit the theater's site for information.");
				}
			});
	},
	masterList: [
		{
			title: 'Belmar Library',
			id: 'library',
			url: 'http://www.jeffcolibrary.org/locations/belmar-library',
			address: '555 S. Allison Pkwy., Lakewood, CO 80226',
			blurb: 'The roof is shaped like an open book.',
			lat: 39.706475,
			lng: -105.084184,
			visibility: ko.observable(true)
		},
		{
			title: 'Belmar Park playground',
			id: 'playground',
			url: 'http://www.lakewood.org/BelmarPark/',
			address: '801 S. Wadsworth Blvd., Lakewood, CO 80226',
			blurb: 'An unusual playground with faux rocks and ropes to climb and balance on.<br> The rest of the park is cool, too.',
			lat: 39.706528,
			lng: -105.089693,
			visibility: ko.observable(true)
		},
		{
			title: 'Caution Brewing Co.',
			id: 'caution',
			url: 'http://www.cautionbrewingco.com/',
			address: '1057 S. Wadsworth Blvd. #60, Lakewood, CO 80226',
			blurb: 'Really low-key, semi-garage brewery vibe.',
			lat: 39.698176,
			lng: -105.082173,
			visibility: ko.observable(true)
		},
		{
			title: 'Century 16 Belmar',
			id: 'century',
			url: 'http://www.cinemark.com/theatre-detail.aspx?node_id=1683&',
			address: '440 S. Teller St., Lakewood, CO 80226',
			blurb: 'Located in the sprawling Belmar shopping center.',
			lat: 39.708582,
			lng: -105.076251,
			visibility: ko.observable(true)
		},
		{
			title: 'Dark Matter Games',
			id: 'darkmatter',
			url: 'http://dmgcolorado.com/',
			address: '1050 S. Wadsworth Blvd., Lakewood, CO 80226',
			blurb: 'Never been here, wonder how the selection is.',
			lat: 39.698142,
			lng: -105.080060,
			visibility: ko.observable(true)
		}
	]
};

// this function gets called once the map has been loaded
var addMarkers = function(list){
	var counter = 0;
	for (i in list) {
		var here = list[i];
		here.marker = new google.maps.Marker({
			position: {lat: here.lat, lng: here.lng},
			map: map,
			title: here.title
		});
		here.infowindow = new google.maps.InfoWindow({
			content: "<h2>" + here.title + "</h2><p class='infoText'>" + here.blurb + "</p>" +
				"<p class='infoDetails'><a href='" + here.url + "'>website</a> | " + here.address +  "</p>",
		});
		// IIFE for click listeners
		(function(markerCopy, infoWindowCopy, counterCopy){
				// click listener for marker pins
				markerCopy.addListener('click', function(){
					infoWindowCopy.open(map, markerCopy);
					markerCopy.setAnimation(google.maps.Animation.BOUNCE);
				});
				infoWindowCopy.addListener('closeclick', function(){
					markerCopy.setAnimation(null);
				})
				// click listener for list of places
				$("#" + counterCopy).click(function(){
					infoWindowCopy.open(map, markerCopy);
					markerCopy.setAnimation(google.maps.Animation.BOUNCE);
				});
			})(here.marker, here.infowindow, counter);
		counter++
	}
};

var viewModel = {
    marks: ko.observableArray(Model.masterList),
	movies: ko.observableArray([]),

    filterQuery: ko.observable(''),

    search: function(value) {
        for(var x in Model.masterList) {
        	// hide list items and markers and close any open infowindows
        	var here = Model.masterList[x];
        	here.visibility(false);
        	here.marker.setVisible(false);
        	here.infowindow.close();
        	// if the user enters something in the search field that matches
        	// something in either the title or blurb of one of the objects,
        	// that object's list item and marker are added back to the map
        	if(here.title.toLowerCase().indexOf(value.toLowerCase()) >= 0 || here.blurb.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            	here.visibility(true);
            	here.marker.setVisible(true);
        	}
        }
    },

    };
viewModel.filterQuery.subscribe(viewModel.search);

ko.applyBindings(viewModel);

var View = {
	init: function(){
		$showtimes = $("#nowShowing");
	}
}

View.init();
Model.init();
