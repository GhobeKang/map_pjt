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
        components: {
            captionofpicture: {
                data: function() {
                    return {
                        caption: "",
                        tag: ""
                    }
                },
                template: `<span class="preview_desc">
                    <label>caption</label>
                    <input type="text" ref="caption" class="preview_caption" v-bind:value="caption" @input="caption = $event.target.value" >
                    <label>tag</label>
                    <input type="text" ref="tag" class="preview_tag" v-model="tag">
                    </span>`,
                methods: {
                    changed: function(code) {
                        this.$emit('input', code)
                    }
                }
            }
        },
        mounted: function() {
            var options = dropzone.mydropzone;
            var initDropzone = new Dropzone('div#dragndropSection', options);
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
                dropzone.mydropzone.removeAllFiles();
            },
            start: function() {
                auth.onAuthStateChanged(function (user){
                    if (user) {
                        var queuedFiles = dropzone.mydropzone.getQueuedFiles();
                        var currentUserID = user.uid;

                        var location = this.location;
                        var date = this.date;
                        var desc = this.desc;
                        var title = this.title;
                        var geometry = this.geometry;
                        var dbTitle;
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
                                    top: centerHeight-200,
                                    left: centerWidth-200
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
                                    duplicationAllImages.push().set(downloadURL);
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