/**
 * Created by Ghobe on 2018-01-10.
 */
window.define(['jquery','firebaseInit'], function($, firebase) {
    var showing_vue = {
        el: '#image-carousel',
        data: {
            images: [],
            captions: [],
            counter: 0
        },
        components: {
            gallerythumbnail: {
                props: ['imageUrl', 'imageCounter', 'caption'],
                data : function() {
                    return {
                        captionContent : ""
                    }
                },
                computed: {
                    counterCal: function () {
                        console.log(this.imageUrl);
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
                    }
                },
                template: `<div class="slide" :class="counterCal"><img :src="imageUrl">
                                <div class="container_captionArea"  v-if="!isCaption">
                                    <textarea class="caption"></textarea>
                                    <button type="button" class="save_caption btn btn-info" @click="saveCaption">Save Caption</button>
                                </div>
                                <span v-if="isCaption">{{captionContent}}</span>
                                </div>`,
                methods : {
                    saveCaption: function() {
                        var __thisConponent = this;
                        var captionContent = $('.caption').val();
                        var captionLocation = this.imageCounter;
                        firebase.auth.onAuthStateChanged(function(user){
                            if (user) {
                                var databasePathToStore = firebase.database.ref('/'+user.uid);
                                databasePathToStore.once('value')
                                    .then(function(userId){
                                        userId.forEach(function(title){
                                            if (title.hasChild('imageInfo')){

                                                var captionLoc = title.child('imageInfo/caption').ref;
                                                var pushKey = captionLoc.push().key;
                                                var captionObject = {
                                                    key_caption: captionLocation,
                                                    val_caption: captionContent
                                                };
                                                captionLoc.child(pushKey).set(captionObject);
                                                console.log(__thisConponent);
                                                __thisConponent.$emit('captionadded', captionObject);
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
            loadingTotalImages: function (totalImages, captions, callback) {
                showingVue.images = totalImages;
                showingVue.captions = captions;

                var beforePosition = 0;
                var imagesNum = totalImages.length - 1;
                var xStart = 0;
                var xMove = 0;
                var xOffset = 0;
                var isDragging = false;


                $('.dragdealer').css('position', 'absolute');

                $('.dragdealer').on('keyup', function (event) {

                    if (event.which == 27) {
                        $('.dragdealer').css('display', 'none');
                        showing_vue.images = [];
                        $('.handle').css('transform', 'translate3d(0, -15% ,0)');
                        $('.handle').off();
                        $(document).off('mouseup')
                    }
                });
                $('.handle').on('mousedown', function (event) {
                    xStart = event.pageX;
                    isDragging = true;
                    console.log('mouse down event');
                });
                $('.handle').on('mousemove', function (event) {
                    if (isDragging) {
                        xMove = event.pageX;
                        var movedDistance = xStart - xMove;
                        var transformYaxis = Math.abs(movedDistance * 0.1);
                        console.log(transformYaxis);
                        xOffset = (beforePosition + (xMove - xStart));
                        $('.handle').css('transform', 'translate3d(' + xOffset + 'px, -15% ,0)');
                        $('.current').css('transform', 'translateY('+transformYaxis+'%)');
                    }
                });
                $(document).on('mouseup', function (event) {
                    var imageOffset = $('.current')["0"].offsetLeft;
                    var imageSize = $('.current')["0"].offsetWidth;
                    var xEnd = event.pageX;
                    var minMoved = imageSize * 0.5;
                    var distance = xStart - xMove;
                    console.log(distance);
                    beforePosition = -imageOffset;
                    $('.current').css('transform', 'translateY(-10%)');

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
                    $('.current').css('transform', 'translateY(0)');
                    isDragging = false;
                    console.log('mouse up event');
                });

                if (typeof callback === 'function') {
                    callback();
                }
            },
            captionAdd : function(captionObj) {
                this.captions.push(captionObj);
            }

        },

        updated: function () {
            this.$nextTick(function () {
                $('.slide:first').addClass('current');
            });
        }
    };

    return {
        show : showing_vue
    }
})
