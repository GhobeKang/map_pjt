/**
 * Created by Ghobe on 2018-01-18.
 */
window.define(['elasticsearch','jquery'], function(elastic, $){
    var client = new $.es.Client({
        hosts: 'localhost:9200'
    });

    client.search({
        index: 'album',
        type: 'seoul city hall',
        body: {
            q: {albumNum: 2}
        }
    }).then(function(erro, response){
        console.log(response)
    });
    return client
})