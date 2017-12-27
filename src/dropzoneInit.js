/**
 * Created by Ghobe on 2017-12-19.
 */

    // Initialize Firebase
var store;
var auth;
var database;

$.getScript('./src/firebaseInit.js', function() {
    console.log('firebaseInit complete');
    store = init.storage();
    auth = init.auth();
    database = init.database();

    init.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('user persistence is working');
        }else {
            console.log('user is null');
        }
    })
});


// Get the template HTML and remove it from the doumenthe template HTML and remove it from the doument
var previewNode = document.querySelector("#template");
previewNode.id = "";
var previewTemplate = previewNode.parentNode.innerHTML;
previewNode.parentNode.removeChild(previewNode);

var myDropzone = new Dropzone("div#dragndropSection", { // Make the whole body a dropzone
    url: "/", // Set the url
    uploadMultiple: true,
    autoQueue: true,
    thumbnailWidth: 80,
    thumbnailHeight: 80,
    parallelUploads: 20,
    autoProcessQueue: false,
    previewTemplate: previewTemplate,
    previewsContainer: "#previews", // Define the container to display the previews
    init: function() {
        this.on('drop', function(file) {
            if ($('#dragndropSection>p').css('display') !== 'none') {
                $('#dragndropSection>p').css('display', 'none');
            }
        })

        // Update the total progress bar
    //     this.on("totaluploadprogress", function(progress) {
    //         document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
    //     });
    //
    //     this.on("sending", function(file) {
    //         // Show the total progress bar when upload starts
    //         document.querySelector("#total-progress").style.opacity = "1";
    //         // And disable the start button
    //         file.previewElement.querySelector(".start").setAttribute("disabled", "disabled");
    //     });
    //
    // // Hide the total progress bar when nothing's uploading anymore
    //     this.on("queuecomplete", function(progress) {
    //         document.querySelector("#total-progress").style.opacity = "0";
    //     });
    }
});
