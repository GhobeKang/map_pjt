/**
 * Created by Ghobe on 2018-02-13.
 */
define(['jquery','usageVue', 'firebaseInit'], function($, vue, firebase){

    var usageVue;
    var auth = firebase.auth;

    $('#usageLink').on('click', function(e) {
        $('.row').addClass('hidden');
        usageVue = new Vue(vue.usageVue);
        usageVue.$mount('.usageVueMount');
    });

    $('#photoMap').on('click', function(e) {
        $('.row').removeClass('hidden');
        usageVue.$destroy();
    });

    $('#LogOut').on('click', function (e) {
        auth.signOut().then(function () {
            location.href = './index.html';
        })
    })

});