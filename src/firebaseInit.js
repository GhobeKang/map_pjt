/**
 * Created by Ghobe on 2017-12-19.
 */

var init = function() {
    var config = {
        apiKey: "AIzaSyBJiUtsVJoQGr9Mfdci7aTXi8iQVTg9KaU",
        authDomain: "picturemap-1513519046916.firebaseapp.com",
        projectId: "picturemap-1513519046916",
        storageBucket: "picturemap-1513519046916.appspot.com",
        databaseURL: "https://picturemap-1513519046916.firebaseio.com/"
    };

    return firebase.initializeApp(config);
}();


