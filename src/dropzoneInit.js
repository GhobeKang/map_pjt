/**
 * Created by Ghobe on 2017-12-19.
 */

window.define(['../lib/dropzone'],function(dropzone) {

    var previewNode = document.querySelector("#template");
    previewNode.id = "";
    var previewTemplate = previewNode.parentNode.innerHTML;
    previewNode.parentNode.removeChild(previewNode);

    var myDropzone = {
        url: "/", // Set the url
        clickable: true,
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
            });
        }
    };
    return {
        mydropzone: myDropzone
    }
});
