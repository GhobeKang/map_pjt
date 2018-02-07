/**
 * Created by Ghobe on 2018-01-10.
 */
define(['google'], function() {
    var initCenterPoint = function() {
        return new Promise(function(resolve, reject) {
            var pos;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(pos);
                })
            }else {
                pos = new google.maps.LatLng(37.54235, 126.9352);
                resolve(pos);
            }
        })
    };

    var mapCreate = function(callback) {
        var map;
        initCenterPoint().then(function(pos) {
            map = new google.maps.Map(document.getElementById('mapDisplayed'), {
                center: pos,
                zoom: 11
            });

            var startMarker = new google.maps.Marker({
                position: pos,
                map: map,
                icon: './img/cutepenguin.gif'
            });
            map.addListener('drag', function () {
                var center = map.getCenter();
                startMarker.setPosition(center);
            });
        }).then(function() {
            if (typeof callback === 'function') {
                callback(map);
            }
        })
    };
    return {
        map : mapCreate
    }
});

