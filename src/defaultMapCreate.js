/**
 * Created by Ghobe on 2018-01-10.
 */
define(['google'], function(){
    var initCenterPoint = new google.maps.LatLng(37.54235, 126.9352);

    var map = new google.maps.Map(document.getElementById('mapDisplayed'), {
        center: initCenterPoint,
        zoom: 11
    });

    var startMarker = new google.maps.Marker({
        position: initCenterPoint,
        map: map,
        icon: './img/cutepenguin.gif'
    });
    map.addListener('drag', function () {
        var center = map.getCenter();
        startMarker.setPosition(center);
    });

    return {
        map : map
    }
});
