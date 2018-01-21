/**
 * Created by Ghobe on 2018-01-18.
 */
window.define(['elasticsearch','jquery'], function(elastic, $){
    var client = new $.es.Client({
        hosts: 'localhost:9200'
    });

    client.search({
        index: 'albums',
        _source :true,
        body:{
            "query": {
                "match": {
                    "albumNum": 0
                }
            }
        }
    }).then(function(root, prev){
        console.log(root)
    });
    return client
})