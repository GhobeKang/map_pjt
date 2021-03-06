/**
 * Created by Ghobe on 2018-01-09.
 */

window.define(['./dropzoneInit',
    'jquery',
    './firebaseInit',
    './elasticsearchClient'
], function(dropzone, jquery, firebase, elastic){
    var store = firebase.store;
    var database = firebase.database;
    var auth = firebase.auth;
    var initDropzone;

    var modal_vue = {
        el: '#addModal',
        data: {
            location : "",
            date: "",
            desc: "",
            title: "",
            geometry: "",
            counter: 0,
            caption: "",
            tag: ""
        },
        mounted: function() {
            var options = dropzone.mydropzone;
            initDropzone = new Dropzone('div#dragndropSection', options);
            this.$nextTick(function() {
                initDropzone.on('addedfile', function(file) {
                    modalVue.counter++;
                })
            })
        },
        methods: {
            fireClick: function() {
                document.getElementById('SearchBtn').focus();
                $('#SearchBtn').trigger('click');
            },
            cancel: function() {
                initDropzone.removeAllFiles();
            },
            start: function() {
                var __modalVue = this;
                auth.onAuthStateChanged(function (user){
                    if (user) {
                        var queuedFiles = initDropzone.getQueuedFiles();
                        var currentUserID = user.uid;

                        var location = __modalVue.location;
                        var date = __modalVue.date;
                        var desc = __modalVue.desc;
                        var title = __modalVue.title;
                        var geometry = __modalVue.geometry;
                        var albumNum;
                        var dbTitle;

                        if (!location || !date || !title) {
                            alert('values of required must fill them in')
                        }else {
                            // album number calculation through a numChildren() function of firebase
                            database.ref('/'+currentUserID).once('value').then(function(snapshot) {
                                if (snapshot.numChildren() === 0) {
                                    albumNum = snapshot.numChildren();
                                }else {
                                    albumNum = snapshot.numChildren() - 1;
                                }
                            });

                            // album title check. firebase is not allow a blank word. that will be replaced to dash word
                            if (title.search(' ') !== -1) {
                                dbTitle = title.replace(' ', '-');
                            }else {
                                dbTitle = title;
                            }

                            // login check
                            if (currentUserID === null) {
                                alert("please log-in")
                            }else {
                                // firebase store connection session
                                var pathRoot = store.ref();
                                // unnecessary anymore, will be deleted (duplication with above check)
                                if (!title) {
                                    alert("please input a title to store a conetent into database")
                                }else {
                                    // UI update, when store process is processing
                                    $('#decisionButtons>.start').attr('disabled', 'disabled');
                                    $('#loadingImage_Back').css('display','block');
                                    $('#loadingImage').css({
                                        top: (window.innerHeight/2)-200,
                                        left: (window.innerWidth/2)-200
                                    });

                                    var downloadURL = [];

                                    // firebase store, images are saved to storage of firebase and return a dataURL array
                                    var imageStoreProcess = function() {
                                        var deferred = $.Deferred();
                                        var counter = 0;

                                        for (var key in queuedFiles) {

                                            var pathInStore = pathRoot.child('/user/'+currentUserID+'/'+dbTitle+'/'+queuedFiles[key].upload.filename);
                                            pathInStore.put(queuedFiles[key]).then(function(snapshot) {
                                                counter++;
                                                downloadURL.push(snapshot.metadata.downloadURLs[0]);

                                            },function(error){
                                                console.log(error);
                                            }).then(function() {
                                                if (counter === queuedFiles.length){
                                                    deferred.resolve();
                                                }
                                            })
                                        }

                                        return deferred.promise();
                                    };
                                    imageStoreProcess().then(function() {

                                        var inputSet = {
                                            userid : currentUserID,
                                            albumNum: albumNum,
                                            imageInfo: {
                                                caption: "",
                                                downloadURL:downloadURL
                                            },
                                            location : location,
                                            date : date,
                                            desc : desc,
                                            title : title,
                                            geometry: geometry
                                        };

                                        //elastic search database
                                        elastic.addAlbum(currentUserID, inputSet);

                                        // firebase database
                                        var databasePath = database.ref('/'+currentUserID+'/'+dbTitle);
                                        var duplicationAllImages = database.ref('/'+currentUserID+'/allImages');
                                        duplicationAllImages.push().set({
                                            downloadURL: downloadURL,
                                            albumNum : albumNum
                                        });

                                        databasePath.set(inputSet)
                                            .then(function() {
                                                $('#loadingImage_Back').css('display','none');
                                                $('#afterSaved').css('display', 'block');
                                                console.log('storing into db is successed!');
                                            })

                                    })
                                }
                            }
                        }
                    }
                })

            },
        },
    };
    return {
        modalVue : modal_vue
    }
});