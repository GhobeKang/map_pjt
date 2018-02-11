/**
 * Created by Ghobe on 2018-02-09.
 */
define(function() {
    var vue = {
        data: {
            imageurl : ''
        },
        template: '<div class="queryResultImage"><span @click="closeModal">&times;</span><img :src="imageurl"></div>',
        methods: {
            closeModal : function() {
                this.$destroy();
            },

            queryResultImageTrans : function(data) {
                this.imageurl = data;
            }
        },
        destroyed : function() {
            $('.queryResultImage').empty();
            $('.queryresultimage_back').css('display','none');
        }
    };
    return {
        vue : vue
    }
})