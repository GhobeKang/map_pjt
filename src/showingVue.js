/**
 * Created by Ghobe on 2018-01-10.
 */
window.define(['jquery','firebaseInit','elasticsearchClient'], function($, firebase, elastic) {
    var showing_vue = {
        el: '#image-carousel',
        data: {
            images: [],
            captions: [],
            tags: [],
            queryresult: [],
            albumNum: 0,
            counter: 0,
            currentView: "gallerythumbnail",
            isShowing: false,
            isQuery : false
        },
        watch: {
            currentView : function() {
                if (this.currentView === 'gallerythumbnail'){
                    $('.imageCarouselTitle').css('display','block');
                    $('.allImageTitle').css('display','none');
                }else {
                    $('.imageCarouselTitle').css('display','none');
                    $('.allImageTitle').css('display','block');
                }
            }
        },
        components: {
            querythumbnail: {
                props : ['imageInfo'],
                template : `<div class="querythumbnail">
                                <img :src="imageInfo.imageUrl" class="gridItem">
                                <div class="thumbnailInfo">
                                    <p>Title : {{imageInfo.title}}</p>
                                    <p>When : {{imageInfo.date}}</p>
                                    <p>Where : {{imageInfo.location}}</p>
                                    <p>{{imageInfo.caption}}</p>
                                </div>
                           </div>`,

            },
            gridthumbnail: {
                props: ['imageUrl', 'imageCounter', 'imageInfo', 'caption'],
                computed: {
                    hasCaption : function() {
                        var __this = this;
                        var caption = "";
                        if (typeof __this.imageInfo.captions[__this.imageCounter] !== 'undefined'){
                            caption = __this.imageInfo.captions[__this.imageCounter].val_caption;
                        }
                        return caption;
                    }
                },
                template: `<div class="gridthumbnail">
                                <img :src="imageUrl" class="gridItem">
                                <div class="thumbnailInfo">
                                    <p>Title : {{imageInfo.title}}</p>
                                    <p>When : {{imageInfo.date}}</p>
                                    <p>Where : {{imageInfo.location}}</p>
                                    <p>{{hasCaption}}</p>
                                </div>
                           </div>`
            },
            gallerythumbnail: {
                props: ['imageUrl', 'imageCounter', 'imageInfo', 'caption', 'tags'],
                data : function() {
                    return {
                        captionContent : "",
                        tagContent : "",
                        isFirstAdd : true
                    }
                },
                computed: {
                    counterCal: function () {
                        var fixedString = 'img' + this.imageCounter;
                        return fixedString;
                    },
                    isCaption: function() {
                        var result = false;
                        for (var cap in this.caption) {
                            if (this.caption[cap].key_caption === this.imageCounter) {
                                this.captionContent = this.caption[cap].val_caption;
                                this.isFirstAdd = false;
                                result = true;
                            }
                        }
                        return result;
                    },
                    isTag : function() {
                        var result = false;
                        for (var tag in this.tags) {
                            if (this.tags[tag].key_tag === this.imageCounter) {
                                this.tagContent = this.tags[tag].val_tag;
                                this.isFirstAdd = false;
                                result = true;
                            }
                        }
                        return result;
                    },
                    tagToArray: function() {
                        var originArray = this.tagContent;
                        var tagArray = originArray.split(',');
                        return tagArray;
                    }
                },
                template: `<div class="slide" :class="counterCal"><img :src="imageUrl">
                                <div class="container_captionArea"  v-if="!isCaption">
                                    <textarea class="caption" v-model="captionContent" placeholder="Caption for Picture"></textarea>
                                    <button type="button" class="save_caption btn btn-info" @click="saveCaption">Save Caption</button>
                                </div>
                                <span v-if="isCaption">{{captionContent}}</span>
                                <div class="container_tag" v-if="!isTag">
                                    <input type="text" class="inputtag" v-model="tagContent">
                                    <button type="button" class="save_caption btn btn-info" @click="saveTag">Save Tag</button>
                                </div>
                                <br>
                                <div class="tagbuttons">
                                    <template v-if="isTag" v-for="value in tagToArray">
                                        <button type="button" class="tag_btn btn btn-default" @click="tagSearch">{{value}}</button>
                                    </template>
                                </div>
                                </div>`,
                methods : {
                    tagSearch : function(event) {
                        var buttonValue = event.target.innerText;
                        var __this = this;

                        elastic.getElastic(buttonValue, function(data) {
                            var resultArray = data.hits.hits;
                            for (var hitCount in resultArray) {
                                var imageInfo = resultArray[hitCount]._source;

                                var albumNum = imageInfo.albumNum;
                                var captionString = imageInfo.caption;
                                var position = imageInfo.position + '';
                                var tagString = imageInfo.tag;

                                elastic.searchImage(albumNum, position, captionString, tagString,
                                    function(albumdata, p, caption, tag) {
                                    var result = albumdata.hits.hits["0"]._source;
                                    var imageUrlSet = result.imageInfo.downloadURL;
                                    var title = result.title;
                                    var date = result.date;
                                    var location = result.location;

                                    for (var image in imageUrlSet) {
                                        console.log(p);
                                        if (image === p) {
                                            var targetImage = imageUrlSet[image];
                                            var imageInfoSet = {
                                                imageUrl : targetImage,
                                                title : title,
                                                date : date,
                                                location : location,
                                                caption : caption,
                                                tag : tag
                                            };
                                            __this.$emit('searchresult', imageInfoSet);
                                        }
                                    }
                                })
                            }
                        });

                    },
                    saveTag : function() {
                        var __thisConponent = this;
                        var tagContent = this.tagContent;
                        var tagLocation = this.imageCounter;
                        var __albumNum = this.imageInfo.albumNum;

                        firebase.auth.onAuthStateChanged(function(user){
                            if (user) {
                                var databasePathToStore = firebase.database.ref('/'+user.uid);
                                databasePathToStore.once('value')
                                    .then(function(userId){
                                        userId.forEach(function(title){
                                            // key => titles (included allimages category)
                                            if (title.hasChild('imageInfo')){
                                                if (title.child('albumNum').val() === __albumNum){
                                                    var captionLoc = title.child('imageInfo/tag').ref;
                                                    var pushKey = captionLoc.push().key;
                                                    var tagObject = {
                                                        key_tag: tagLocation,
                                                        val_tag: tagContent
                                                    };
                                                    captionLoc.child(pushKey).set(tagObject);

                                                    if (__thisConponent.isFirstAdd) {
                                                        elastic.addElastic(__albumNum, tagLocation, tagContent, 'tag', false);
                                                        __thisConponent.isFirstAdd = false;
                                                    }else {
                                                        elastic.addElastic(__albumNum, tagLocation, tagContent, 'tag', true);
                                                    }

                                                    var allimageTagSave = firebase.database.ref('/' + user.uid + '/allImages');
                                                    allimageTagSave.once('value')
                                                        .then(function(allimage_key){
                                                            allimage_key.forEach(function (album) {
                                                                if (album.child('albumNum').val() === __albumNum){
                                                                    var allimageCaptionPath = album.child('tag').ref;
                                                                    allimageCaptionPath.push().set(tagObject);
                                                                }
                                                            })
                                                        });

                                                    __thisConponent.$emit('tagadded', tagObject);


                                                }
                                            }
                                        })
                                    })
                            }
                        })

                    },
                    saveCaption: function() {
                        var __thisConponent = this;
                        var captionContent = this.captionContent;
                        var captionLocation = this.imageCounter;
                        var __albumNum = this.imageInfo.albumNum;

                        firebase.auth.onAuthStateChanged(function(user){
                            if (user) {
                                var databasePathToStore = firebase.database.ref('/'+user.uid);
                                databasePathToStore.once('value')
                                    .then(function(userId){
                                        userId.forEach(function(title){
                                            // key => titles (included allimages category)
                                            if (title.hasChild('imageInfo')){
                                                if (title.child('albumNum').val() === __albumNum){
                                                    var captionLoc = title.child('imageInfo/caption').ref;
                                                    var pushKey = captionLoc.push().key;
                                                    var captionObject = {
                                                        key_caption: captionLocation,
                                                        val_caption: captionContent
                                                    };

                                                    if (__thisConponent.isFirstAdd) {
                                                        elastic.addElastic(__albumNum, captionLocation, captionContent, 'caption', false);
                                                        __thisConponent.isFirstAdd = false;
                                                    }else {
                                                        elastic.addElastic(__albumNum, captionLocation, captionContent, 'caption', true);
                                                    }

                                                    captionLoc.child(pushKey).set(captionObject);

                                                    var allimageCaptionSave = firebase.database.ref('/' + user.uid + '/allImages');
                                                    allimageCaptionSave.once('value')
                                                        .then(function(allimage_key){
                                                            allimage_key.forEach(function (album) {

                                                                if (album.child('albumNum').val() === __albumNum){
                                                                    var allimageCaptionPath = album.child('captions').ref;
                                                                    allimageCaptionPath.push().set(captionObject);
                                                                }
                                                            })
                                                        });

                                                    __thisConponent.$emit('captionadded', captionObject);


                                                }
                                            }
                                        })
                                    })
                            }
                        })
                    }
                },
                mounted : function() {
                    this.$nextTick(function() {
                        $('.slide').unwrap('.wrap_component');
                    });
                }
            }
        },
        methods: {
            closeQueryWindow : function() {
                this.isQuery = false;
                $('.queryresultshow').empty();
                $('.queryresultshow').append(`<div class="queryResultTitle">
                                                <p>Search result</p>
                                            </div>
                                            <div class="queryResultClose">
                                                <button type="button" class="btn-warning btn" id="resultClose" @click="closeQueryWindow">Close</button>
                                            </div>
                                            <template v-for="(val, key) in queryresult">
                                                <querythumbnail :image-Info="val"></querythumbnail>
                                            </template>`);
                this.queryresult = [];
            },
            closeGallery: function() {
                $('.dragdealer').css('display', 'none');
                this.$destroy();
            },
            loadGridGallery : function(totalImages, currentView, imageInfo, callback) {
                var __this = this;
                this.images = imageInfo;
                this.currentView = currentView;

                $('.allImageTitle>span').on('click', function(e) {
                    __this.closeGallery();
                });

                $('.handle').css({
                    position: 'relative',
                    margin: '0 4% auto',
                    top: '0',
                    left : '0',
                    transform: 'translateY(0)',
                    cursor: 'auto',
                    width: '96%',
                    overflowY : 'scroll'
                });
                $('.dragdealer').css('position', 'absolute');
                $('.dragdealer').css('display', 'block');
            },
            loadingTotalImages: function (totalImages, captions, albumNum, tag, callback) {
                var __this = this;
                this.currentView = 'gallerythumbnail';
                this.images = totalImages;
                this.captions = captions;
                this.tags = tag;
                this.albumNum = albumNum;

                var beforePosition = 0;
                var imagesNum = totalImages[0].totalImageOfthis.length - 1;
                var xStart = 0;
                var xMove = 0;
                var xOffset = 0;
                var isDragging = false;

                $('.handle').css({
                    position: 'fixed',
                    top: '50%',
                    transform: 'translateY(-15%)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    width: '800%',
                    "z-index": '-1'
                });

                $('.dragdealer').css('position', 'absolute');
                if (imagesNum > 18) {
                    var ratio = 800*(Math.round(imagesNum / 18) + 1) + '';
                    $('.handle').css('width', ratio+'%');
                }


                $('.dragdealer').on('keyup', function (event) {

                    if (event.which == 27) {
                        $('.dragdealer').css('display', 'none');
                        showing_vue.images = [];
                        $('.handle').css('transform', 'translate3d(0, -15% ,0)');
                        $('.handle').off();
                        $(document).off('mouseup');
                        __this.$destroy();
                    }
                });
                $('.handle').on('mousedown touchstart', function (event) {

                    if (event.type === 'touchstart') {

                        xStart = event.originalEvent.touches['0'].pageX;
                    }else {
                        xStart = event.pageX;
                    }
                    isDragging = true;
                    console.log('mouse down event');
                });
                $('.handle').on('mousemove touchmove', function (event) {

                    if (isDragging) {
                        if (event.type === 'touchmove') {
                            event.preventDefault();
                            xMove = event.originalEvent.touches['0'].pageX;
                        }else {
                            xMove = event.pageX;
                        }
                        var movedDistance = xStart - xMove;

                        var transformYaxis = Math.abs(movedDistance * 0.1);
                        xOffset = (beforePosition + (xMove - xStart));
                        $('.handle').css('transform', 'translate3d(' + xOffset + 'px, -15% ,0)');
                        $('.current').css('transform', 'perspective(1px) translateZ(-'+(transformYaxis/500)+'px)');

                    }
                });
                $(document).on('mouseup touchend', function (event) {
                    var imageOffset = $('.current')["0"].offsetLeft;
                    var imageSize = $('.current')["0"].offsetWidth;
                    var xEnd;
                    console.log(event);
                    if (event.type === 'touchend') {
                        xEnd = event.changedTouches['0'].pageX;
                    }else {
                        xEnd = event.pageX;
                    }
                    var minMoved = imageSize * 0.5;
                    var offset_M = xStart - xMove;
                    var distance = xStart - xEnd;

                    beforePosition = -imageOffset;

                    // $('.current').css('top', '-1in');

                    if (isDragging) {
                        if (Math.abs(distance) > 10) {
                            $('.current').css({
                                transform: 'perspective(15px) translateZ(-2px)',
                                animation: 'slideIn 4s'
                            });
                        }

                        if (offset_M > minMoved) {
                            if (xStart > xEnd) {
                                xOffset = -imageOffset - imageSize;
                                beforePosition = xOffset;

                                if ($('.current')["0"].nextSibling) {
                                    var next = "." + $('.current')["0"].nextSibling.classList["1"];

                                    $('.current').removeClass('current');
                                    $(next).addClass('current');
                                }
                            }

                        } else if(offset_M < -minMoved) {
                            xOffset = -imageOffset + imageSize;
                            beforePosition = xOffset;

                            if ($('.current')["0"].previousSibling) {
                                var prev = "." + $('.current')["0"].previousSibling.classList["1"];

                                $('.current').removeClass('current');
                                $(prev).addClass('current');
                            }
                        } else {
                            xOffset = -imageOffset
                        }

                        if (xOffset > 0) {
                            xOffset = 0;
                        } else if (xOffset < -(imageSize * imagesNum)) {
                            xOffset = -(imageSize * imagesNum)
                        }
                        $('.handle').css('transform', 'translate3d(' + xOffset + 'px, -15% ,0)');
                        $('.current').css({
                            transform: 'perspective(15px) translateZ(0px)',
                        });

                        isDragging = false;

                    }
                    console.log('mouse up event');
                });

                $('.imageCarouselTitle>span').click(function() {
                    $('.dragdealer').css('display', 'none');
                    showing_vue.images = [];
                    $('.handle').css('transform', 'translate3d(0, -15% ,0)');
                    $('.handle').off();
                    $(document).off('mouseup');
                    __this.$destroy();
                });

                if (typeof callback === 'function') {
                    callback();
                }
            },

            captionAdd : function(captionObj) {
                this.captions.push(captionObj);
            },

            tagAdd : function(tagObj) {
                this.tags.push(tagObj);
            },

            queryGridGallery : function(imageInfoSet) {
                this.queryresult.push(imageInfoSet);
                this.isQuery = true;
            }

        },

        destroyed: function() {
            this.isShowing = false;

            $('.handle').empty();

            $('.handle').append(`<template v-for="(val, key) in images">
            <div class="wrap_component" v-for="(val1, key1) in val.totalImageOfthis" :key="val1">
                <component :is="currentView" :tags="tags" :image-Url="val1" :image-Counter="key1" :image-Info="val" :caption="captions"
                           @captionadded="captionAdd" @tagadded="tagAdd" @searchresult="queryGridGallery"></component>
            </div>
        </template>`);
        },

        updated: function () {
            if (!this.isShowing) {
                this.$nextTick(function () {
                    $('.slide:first').addClass('current');
                });
                this.isShowing = true;
            }
        }
    };

    return {
        show : showing_vue
    }
})
