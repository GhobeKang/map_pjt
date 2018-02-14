/**
 * Created by Ghobe on 2018-02-13.
 */
define(['jquery'], function() {
    var usageVue = {
        template : '#usageVueTemplate',
        destroyed: function() {
            $('.guideImages').wrap('<template class="usageVueMount"></template>');
            $('.usageVueMount').empty();
        }
    };

    return {
        usageVue : usageVue
    }
})