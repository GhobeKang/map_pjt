/**
 * Created by Ghobe on 2018-01-10.
 */
window.define(['firebaseInit','google','defaultMapCreate','showingVue','elasticsearchClient','googlePlaceSearch'],
    function(firebase, g, defaultmap, show, elastic, placeSearch) {

    var auth = firebase.auth;
    var database = firebase.database;
    var curUser;
    var map;
    defaultmap.map(function(val) {
        map = val;
    });

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
                    props: ['imageInfo','contentTitle', 'imageUrl', 'totalContents', 'totalImages', 'databaseTitle', 'location'
                        , 'geo', 'caption', 'albumNum', 'tag', 'quotes'],
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
                                this.$emit('checked', {
                                    title : val["0"],
                                    num: this.albumNum
                                });
                            } else {
                                this.$emit('checked', {
                                    title : oldVal["0"],
                                    num : this.albumNum
                                });
                            }
                        }
                    },
                    methods: {
                        moveToLocation: function () {
                            map.setCenter({lat: this.geo.lat, lng: this.geo.lng});
                        },
                        showImages: function () {
                            var showingVue = new Vue(show.show);

                            if (this.albumNum === this.imageInfo.length-1){
                                var imageSlice = this.imageInfo.slice(this.albumNum);
                            }else {
                                var imageSlice = this.imageInfo.slice(this.albumNum,1);
                            }

                            showingVue.loadingTotalImages(imageSlice, this.caption, this.albumNum, this.tag,
                                this.quotes, function () {
                                $('.dragdealer').attr('tabindex', -1).focus();
                                $('.dragdealer').css('display', 'block');
                            });
                        }
                    }
                }
            },
            methods: {
                allImagesShowing: function () {
                    var __this = this;
                    var showingVue = new Vue(show.show);

                    var allImages = [];

                        showingVue.loadGridGallery(allImages, 'gridthumbnail', __this.images, function() {

                        });

                },
                checkedContentCollect: function (checked) {
                    for (var i = 0; i < this.checkedItems.length; i++) {
                        var oldItem = this.checkedItems[i].title;

                        if (oldItem === checked.title) {
                            this.checkedItems.splice(i , 1);
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
                    var checkedItem = this.checkedItems;

                    for (var index in checkedItem) {
                        if (checkedItem[index] !== null) {
                            var albumNum = checkedItem[index].num;
                            var contentTitle = checkedItem[index].title;

                            elastic.delAlbum(albumNum, user.uid);

                            database.ref('/' + curUserID.currentUser.uid + '/allImages').once('value')
                                .then(function(snap){
                                    snap.forEach(function(e){
                                        console.log(e.val());
                                        if(e.val().albumNum === albumNum) {
                                            snap.ref.remove();
                                        }
                                    })
                                });
                            database.ref('/' + curUserID.currentUser.uid + '/' + contentTitle).remove()
                                .then(function () {
                                    console.log('deleted album');
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
                    var albumNum = 0;
                    var date = "";
                    var quotes = [];

                    database.ref('/quote/quotes/').once('value').then(function(quotesArray) {
                        quotesArray.forEach(function(quote) {
                            quotes.push(quote.val());
                        })
                    });

                    if (curUser !== null) {
                        curUserID.onAuthStateChanged(function(user){
                            if (user){
                                var databaseRef = database.ref('/' + curUserID.currentUser.uid);
                                databaseRef.once('value').then(function (data) {
                                    //title
                                    data.forEach(function (datasnapshot) {

                                        if (datasnapshot.hasChild('imageInfo')) {
                                            databaseTitle = datasnapshot.key;
                                            var imageArray = [];
                                            var captionArray = [];
                                            var tagArray = [];
                                            albumNum = datasnapshot.child('albumNum').val();
                                            geo = datasnapshot.child('geometry').val();
                                            contentTitle = datasnapshot.child('title').val();
                                            location = datasnapshot.child('location').val();
                                            date = datasnapshot.child('date').val();
                                            datasnapshot.child('imageInfo/downloadURL').forEach(function (urls) {
                                                imageArray.push(urls.val());
                                            });

                                            datasnapshot.child('imageInfo/caption').forEach(function (caption) {
                                                captionArray.push(caption.val());
                                            });

                                            datasnapshot.child('imageInfo/tag').forEach(function (tag) {
                                                tagArray.push(tag.val());
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
                                                '</div>' +
                                                '<button type="button" class="btn default-btn infowWindowSearchBtn">NearBy Search</button>' +
                                                '<div class="infoWindowThumbnailImages">';

                                            // if (!imageArray.length === 0) {
                                                for (var idx in imageArray) {
                                                    infoContent += '<img class="infoWindowImage" src='+imageArray[idx]+'>'
                                                }
                                            // }
                                            infoContent += '</div>';

                                            var infoWindow = new google.maps.InfoWindow({
                                                content: infoContent
                                            });

                                            initMarker.addListener('click', function(event) {
                                                var __event = event;
                                                infoWindow.open(map, initMarker);
                                                $('.infowWindowSearchBtn').click(function(event) {
                                                    infoWindow.close();
                                                    placeSearch.searchPlace(__event.latLng, map);
                                                    map.setZoom(15);
                                                });
                                            });

                                            thumbnail_vue.data.images.push({
                                                albumNum : albumNum,
                                                title: contentTitle,
                                                dbTitle: databaseTitle,
                                                representedImage: imageArray[0],
                                                counter: imageArray.length,
                                                totalImageOfthis: imageArray,
                                                location: location,
                                                geo: geo,
                                                captions: captionArray,
                                                date : date,
                                                tag : tagArray,
                                                quotes : quotes
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