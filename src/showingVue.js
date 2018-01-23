/**
 * Created by Ghobe on 2018-01-10.
 */
window.define(['jquery','firebaseInit'], function($, firebase) {
    var showing_vue = {
        el: '#image-carousel',
        data: {
            images: [],
            captions: [],
            tags: [],
            albumNum: 0,
            counter: 0,
            currentView: "gallerythumbnail"
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
                        tagContent : ""
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
                                    <textarea class="caption"></textarea>
                                    <button type="button" class="save_caption btn btn-info" @click="saveCaption">Save Caption</button>
                                </div>
                                <span v-if="isCaption">{{captionContent}}</span>
                                <div class="container_tag" v-if="!isTag">
                                    <input type="text" class="inputtag">
                                    <button type="button" class="save_caption btn btn-info" @click="saveTag">Save Tag</button>
                                </div>
                                <br>
                                <template v-if="isTag" v-for="value in tagToArray">
                                    <button type="button" class="tag_btn btn btn-default">{{value}}</button>
                                </template>
                                </div>`,
                methods : {
                    saveTag : function() {
                        var __thisConponent = this;
                        var tagContent = $('.inputtag').val();
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
                        var captionContent = $('.caption').val();
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
                }

            }
        },
        methods: {
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
                    height: '100%',
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
                        $('.current').css('transform', 'translateY('+transformYaxis+'%)');
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
                    var distance = xStart - xMove;

                    beforePosition = -imageOffset;
                    $('.current').css('transform','translateY(0)');
                    $('.current').css('top', '-1in');

                    if (isDragging) {
                        if (distance > minMoved) {
                            if (xStart > xEnd) {
                                xOffset = -imageOffset - imageSize;
                                beforePosition = xOffset;

                                if ($('.current')["0"].nextSibling) {
                                    var next = "." + $('.current')["0"].nextSibling.classList["1"];

                                    $('.current').removeClass('current');
                                    $(next).addClass('current');
                                }
                            }

                        } else if(distance < -minMoved) {
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
                        $('.current').css('top', '0');
                        isDragging = false;

                    }
                    console.log('mouse up event');
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
            }

        },

        destroyed: function() {
            $('.handle').empty();

            $('.handle').append(`<template v-for="(val, key) in images">
            <template v-for="(val1, key1) in val.totalImageOfthis">
                <component :is="currentView" :image-Url="val1" :image-Counter="key1" :image-Info="val" :caption="captions" @captionadded="captionAdd"></component>
            </template>
        </template>`);
        },

        updated: function () {
            this.$nextTick(function () {
                $('.slide:first').addClass('current');
                $('.current').css('top','0')
            });
        }
    };

    return {
        show : showing_vue
    }
})
