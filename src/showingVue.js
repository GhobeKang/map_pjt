/**
 * Created by Ghobe on 2018-01-10.
 */
window.define(['jquery'], function($) {
    var showing_vue = {
        el: '#image-carousel',
        data: {
            images: [],
            counter: 0
        },
        components: {
            gallerythumbnail: {
                props: ['imageUrl', 'imageCounter'],
                computed: {
                    counterCal: function () {
                        console.log(this.imageUrl);
                        var fixedString = 'img' + this.imageCounter;
                        return fixedString;
                    },
                },
                template: `<div class="slide" :class="counterCal"><img :src="imageUrl"></div>`

            }
        },
        methods: {
            loadingTotalImages: function (totalImages, callback) {
                showingVue.images = totalImages;

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
                        $('.handle').css('transform', 'translate3d(0, 0 ,0)');
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
                        xOffset = (beforePosition + (xMove - xStart));
                        $('.handle').css('transform', 'translate3d(' + xOffset + 'px, 0 ,0)');
                    }
                });
                $(document).on('mouseup', function (event) {
                    var imageOffset = $('.current')["0"].offsetLeft;
                    var imageSize = $('.current')["0"].offsetWidth;
                    var xEnd = event.pageX;
                    var minMoved = imageSize * 0.5;
                    var distance = xStart - xMove;
                    beforePosition = -imageOffset;
                    if (Math.abs(distance) > minMoved) {
                        if (xStart > xEnd) {
                            xOffset = -imageOffset - imageSize;
                            beforePosition = xOffset;

                            if ($('.current')["0"].nextSibling) {
                                var next = "." + $('.current')["0"].nextSibling.classList["1"];

                                $('.current').removeClass('current');
                                $(next).addClass('current');
                            }
                        } else {
                            xOffset = -imageOffset + imageSize;
                            beforePosition = xOffset;

                            if ($('.current')["0"].previousSibling) {
                                var prev = "." + $('.current')["0"].previousSibling.classList["1"];

                                $('.current').removeClass('current');
                                $(prev).addClass('current');
                            }
                        }

                    } else {
                        xOffset = -imageOffset
                    }

                    if (xOffset > 0) {
                        xOffset = 0;
                    } else if (xOffset < -(imageSize * imagesNum)) {
                        xOffset = -(imageSize * imagesNum)
                    }

                    $('.handle').css('transform', 'translate3d(' + xOffset + 'px, 0 ,0)');
                    isDragging = false;
                    console.log('mouse up event');
                });

                if (typeof callback === 'function') {
                    callback();
                }
            },

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
