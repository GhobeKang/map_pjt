/**
 * Created by Ghobe on 2018-01-10.
 */

require(['google','bootstrap'], function(g, boot) {
    // t.thumbnailVue.imagesLoad();
    var initCenterPoint = new google.maps.LatLng(37.54235, 126.9352);

    $('#addModal').on('hidden.bs.modal', function() {
        window.location.reload();
    });
    $('#addModal').on('show.bs.modal', function() {

        $('#SearchBtn').on('click', function() {
            var address = modalVue.location;
            geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                address: address
            }, function(result, status) {
                if (status === 'OK') {
                    var marker = new google.maps.Marker({
                        map: modalMap,
                        position: result[0].geometry.location
                    });
                    modalVue.geometry = {
                        lat :result[0].geometry.location.lat(),
                        lng: result[0].geometry.location.lng()
                    };
                    modalMap.setCenter(result[0].geometry.location);
                }
            })
        })
    });
    $('#addModal').on('shown.bs.modal', function() {

        modalMap = new google.maps.Map(document.getElementById('searchMap'), {
            center: initCenterPoint,
            zoom: 15
        });
        var circle = new google.maps.Circle({
            center: initCenterPoint,
            radius: 100000
        });
        var option = {
            bounds: circle.getBounds(),
            type: ['(cities)']
        };
        var input = document.getElementById('inputLocationName');
        autocomplete = new google.maps.places.Autocomplete(input, option);
        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace().formatted_address;
            modalVue.location = place;
        });
        modalMap.addListener('center_changed', function() {

            var mapCenter = modalMap.getCenter();
            var circleBoundary = new google.maps.Circle({
                center: mapCenter,
                radius: 100000
            });
            autocomplete.setBounds(circleBoundary.getBounds());
        });
    });
    $('#LogOut').on('click', function () {
        auth.signOut().then(function () {
            location.href = 'home.html';
        })
    })

});

