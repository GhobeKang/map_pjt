/**
 * Created by Ghobe on 2018-01-10.
 */
window.define(['firebaseInit','google','defaultMapCreate'],function(firebase, g, defaultmap) {
    var auth = firebase.auth;
    var database = firebase.database;
    var curUser;

    var map = defaultmap.map;

    auth.onAuthStateChanged(function (user) {
        if (user){
            curUser = user;
        }
    });
        var curUserID = auth;

        var thumbnail_vue = {
            el: '#thumbnails',
            data: {
                images: [],
                checkedItems: []
            },
            components: {
                thumbnail: {
                    props: ['contentTitle', 'imageUrl', 'totalContents', 'totalImages', 'databaseTitle', 'location'
                        , 'geo'],
                    computed: {
                        fullLength: function () {
                            var contents_Num = this.totalContents;
                            var imageWidth = $('.slide>img').width();
                            return contents_Num * imageWidth;
                        }
                    },
                    data: function () {
                        return {
                            checked: []
                        }
                    },
                    template: `<div>
                                    <input class=removeCheck type="checkbox" v-bind:value="databaseTitle" id=":contentTitle" v-model="checked">
                                    <label for=":contentTitle">{{contentTitle}}</label>
                                    <a href="#" class="thumbnail" @click="showImages" @mouseover="moveToLocation">
                                        <img v-bind:src="imageUrl" alt="...">
                                        <span class="badge">+{{totalContents}}</span>
                                    </a>
                                </div>`,
                    watch: {
                        checked: function (val, oldVal) {
                            if (val.length !== 0) {
                                this.$emit('checked', val["0"]);
                            } else {
                                this.$emit('checked', oldVal["0"]);
                            }
                        }
                    },
                    methods: {
                        moveToLocation: function () {
                            map.setCenter({lat: this.geo.lat, lng: this.geo.lng});
                        },
                        showImages: function () {

                            showingVue.loadingTotalImages(this.totalImages, function () {
                                $('.dragdealer').attr('tabindex', -1).focus();
                                $('.dragdealer').css('display', 'block');
                            });
                        }
                    }
                }
            },
            methods: {
                allImagesShowing: function () {
                    var allImages = [];

                    var locationofDB = database.ref('/' + curUserID.currentUser.uid + '/allImages');
                    locationofDB.once('value').then(function (snap) {
                        snap.forEach(function (result) {
                            for (var index in result.val()) {
                                allImages.push(result.val()[index]);
                            }
                        })
                    }).then(function () {
                        showingVue.loadingTotalImages(allImages, function () {
                            $('.dragdealer').attr('tabindex', -1).focus();
                            $('.dragdealer').css('display', 'block');
                        });
                    })
                },
                checkedContentCollect: function (checked) {
                    for (var i = 0; i < this.checkedItems.length; i++) {
                        if (this.checkedItems[i] === checked) {
                            this.checkedItems[i] = null;
                            return;
                        }
                    }
                    this.checkedItems.push(checked);
                },
                cancelAlbum: function () {
                    $('.deleteAlbum_buttons').css('display', 'none');
                    $('.removeCheck').css('display', 'none');
                },
                deleteAlbum: function () {
                    var database = init.database();
                    var store = init.storage();
                    var contentTitle = this.checkedItems;

                    for (var title in contentTitle) {
                        if (contentTitle[title] !== null) {
                            database.ref('/' + curUserID.currentUser.uid + '/' + contentTitle[title]).remove()
                                .then(function () {
                                    console.log('deleted album')
                                    setTimeout(window.location.reload(), 200);
                                })

                        }
                    }
                },
                removeAlbum: function () {
                    $('.deleteAlbum_buttons').css('display', 'block');
                    $('.removeCheck').css('display', 'inline');
                },
                imagesLoad: function (callback) {
                    var contentTitle = '';
                    var databaseTitle = '';
                    var location = '';
                    var geo = "";

                    if (curUser !== null) {
                        curUserID.onAuthStateChanged(function(user){
                            if (user){
                                var databaseRef = database.ref('/' + curUserID.currentUser.uid);
                                databaseRef.once('value').then(function (data) {
                                    //title
                                    data.forEach(function (datasnapshot) {

                                        if (datasnapshot.hasChild('imageInfo')) {
                                            databaseTitle = datasnapshot.key;
                                            var resultArray = [];

                                            geo = datasnapshot.child('geometry').val();
                                            contentTitle = datasnapshot.child('title').val();
                                            location = datasnapshot.child('location').val();
                                            datasnapshot.child('imageInfo/downloadURL').forEach(function (urls) {
                                                resultArray.push(urls.val());
                                            });
                                            var initMarker = new google.maps.Marker({
                                                clickable: true,
                                                map: map,
                                                position: ({lat: geo.lat, lng: geo.lng}),
                                                animation: google.maps.Animation.DROP,
                                                icon: './img/bluePin.png'
                                            });
                                            var infoContent = '<div>' +
                                                '<p><strong style="font-size:20px; font-family: miseng"><span><img src=""></span>Pinto  [' + location + ']</strong></p>' +
                                                '<p><strong>Piece Name : </strong>' + datasnapshot.child('title').val() + '</p>' +
                                                '<p><strong>Detail : </strong>' + datasnapshot.child('desc').val() + '</p>' +
                                                '</div>';
                                            var infoWindow = new google.maps.InfoWindow({
                                                content: infoContent
                                            });

                                            initMarker.addListener('mouseover', function (event) {
                                                infoWindow.open(map, initMarker);
                                            });
                                            initMarker.addListener('mouseout', function (event) {
                                                infoWindow.close();
                                            });

                                            thumbnail_vue.data.images.push({
                                                title: contentTitle,
                                                dbTitle: databaseTitle,
                                                representedImage: resultArray[0],
                                                counter: resultArray.length,
                                                totalImageOfthis: resultArray,
                                                location: location,
                                                geo: geo
                                            });
                                        } else {
                                            console.log('this is Allimage section, skip');
                                        }


                                    });
                                }).then(function () {
                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                })
                            }
                        })

                    }
                }
            },
            mounted: function () {
                this.imagesLoad(function () {
                    console.log('its done')
                })
            },
        };
        return {
            thumbnailVue : thumbnail_vue
        }


});