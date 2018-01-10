/**
 * Created by Ghobe on 2017-12-19.
 */

window.define(['firebase','jquery'], function() {

    var config = {
        apiKey: "AIzaSyBJiUtsVJoQGr9Mfdci7aTXi8iQVTg9KaU",
        authDomain: "picturemap-1513519046916.firebaseapp.com",
        projectId: "picturemap-1513519046916",
        storageBucket: "picturemap-1513519046916.appspot.com",
        databaseURL: "https://picturemap-1513519046916.firebaseio.com/"
    };

    var init = firebase.initializeApp(config);
    if (init.auth() !== null) {
        init.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log('user persistence is working');
            }else {
                console.log('user is null');
            }
        });
    }
    return {
        auth: init.auth(),
        store : init.storage(),
        database : init.database()
    }
});



