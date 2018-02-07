/**
 * Created by Ghobe on 2018-02-06.
 */
define(['google'], function() {
    var placePinInfo = function(placePin, searchResult) {
        var placeName = searchResult.name;
        var placeLocation = searchResult.formatted_address;

        var placeRating = null;
        if (searchResult.rating) {
            placeRating = searchResult.rating;
        }

        var placePhotos = [];
        if (searchResult.photos) {
            for (var i=0 ; i<searchResult.photos.length ; i++) {
                placePhotos.push(searchResult.photos[i].getUrl({
                    maxWidth: 200,
                    maxHeight: 100
                }));
            }
        }

        var content = '<div class="placeInfo"><p class="placeName"><span>'+placeName+'</span> / ' +
            '<span>'+placeRating+'</span></p>' +
            '<p class="placeLocation">'+placeLocation+'</p>' +
            '<div class="placeImages">';

        for (var i=0 ; i < placePhotos.length ; i++) {
            content += '<span><img src="'+placePhotos[i]+'"></span>'
        }
        content += '</div></div>';


        return new google.maps.InfoWindow({
            content : content
        })
    };

    var searchPlace = function(geometry, map) {
        var placeService = new google.maps.places.PlacesService(map);
        placeService.nearbySearch({
            location: ({lat: geometry.lat(), lng: geometry.lng()}),
            radius : '50000',
            rankBy : google.maps.places.RankBy.PROMINENCE,
            types : ['amusement_park','aquarium','art_gallery','bakery','cafe','campground','casino','cemetery','city_hall'
                ,'department_store','library','museum','park','shopping_mall','university','zoo']
        }, function(results, status){
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    var placeid = results[i].place_id;
                    placeService.getDetails({
                        placeId: placeid
                    },callback);

                    var callback = function(result, status) {
                        if (status  == google.maps.places.PlacesServiceStatus.OK) {
                            console.log(result);
                            var placePin = new google.maps.Marker({
                                map: map,
                                position : result.geometry.location,
                                animation : google.maps.Animation.DROP,
                                icon : './img/greenPin.png'
                            });
                            var info = placePinInfo(placePin, result);

                            placePin.addListener('click', function() {
                                info.open(map,placePin);
                            });
                        }
                    }

                }
            }
        })
    };

    return {
        searchPlace : searchPlace
    }
});