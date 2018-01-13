/**
 * Created by Ghobe on 2018-01-09.
 */

window.define(['./dropzoneInit',
'jquery',
'./firebaseInit',
], function(dropzone, jquery, firebase){
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

                        database.ref('/'+currentUserID).once('value').then(function(snapshot) {
                            if (snapshot.numChildren() === 0) {
                                albumNum = snapshot.numChildren();
                            }else {
                                albumNum = snapshot.numChildren() - 1;
                            }
                        });

                        if (title.search(' ') !== -1) {
                            dbTitle = title.replace(' ', '-');
                        }else {
                            dbTitle = title;
                        }

                        if (currentUserID === null) {
                            alert("please log-in")
                        }else {
                            var pathRoot = store.ref();
                            if (!title) {
                                alert("please input a title to store a conetent into database")
                            }else {
                                $('#decisionButtons>.start').attr('disabled', 'disabled');
                                $('#loadingImage_Back').css('display','block');
                                $('#loadingImage').css({
                                    top: (window.innerHeight/2)-200,
                                    left: (window.innerWidth/2)-200
                                });
                                var downloadURL = [];
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
                })

            },
        },
    };
    return {
        modalVue : modal_vue
    }
});