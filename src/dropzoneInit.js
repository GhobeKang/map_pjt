/**
 * Created by Ghobe on 2017-12-19.
 */

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
            if ($('#defaultMsg').css('display') !== 'none') {
                $('#defaultMsg').css('display', 'none');
            }
        })
    }
});
