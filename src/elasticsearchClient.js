/**
 * Created by Ghobe on 2018-01-18.
 */
window.define(['elasticsearch','jquery'], function(elastic, $){
    var addAlbumElastic = function(albumNum, json) {
        var url = 'http://localhost:9200/albums/albumInfo/'+albumNum+'/';

        $.ajax({
            async: true,
            crossDomain: true,
            url: url,
            data: JSON.stringify(json),
            contentType: 'application/json',
            dataType: 'json',
            method: 'POST',
            success: function(data, textStatus, xhr) {
                console.log(data);
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR);
            }
        })
    };

    var addElastic = function(albumNum, position, value, where, isUpdate) {
        var url;
        var insertJson;

        if (where === 'caption') {
            insertJson = {
                albumNum : albumNum,
                position : position,
                caption : value
            }
        }else if (where === 'tag') {
            insertJson = {
                albumNum : albumNum,
                position : position,
                tag : value
            }
        }

        if (isUpdate) {
            url = 'http://localhost:9200/albums/subInfo/'+albumNum+'/_update';
            if (where === 'caption') {
                insertJson = {
                    'doc': {
                        caption: value
                    }
                }
            }else if (where === 'tag') {
                insertJson = {
                    'doc': {
                        tag: value
                    }
                }
            }
        }else {
            url = 'http://localhost:9200/albums/subInfo/'+albumNum;
        }


        $.ajax({
            async: true,
            crossDomain: true,
            url: url,
            data: JSON.stringify(insertJson),
            contentType: 'application/json',
            dataType: 'json',
            method: 'POST',
            success: function(data, textStatus, xhr) {
                console.log(data);
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR);
            }
        })
    };


    var deleteElastic = function(index) {
        $.ajax({
            async: true,
            crossDomain: true,
            url : 'http://localhost:9200/'+index+'/',
            method: 'DELETE',
            success: function(data, textStatus, xhr) {
                console.log(data);
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR)
            }
        })
    };


    var getElastic = function(searchString, callback) {
        var searchQuery = {

            query: {
                term : { tag : searchString }
            }

        };
        $.ajax({
            async: true,
            crossDomain: true,
            processData : false,
            url : 'http://localhost:9200/albums/_search/?filter_path=hit.hit._source',
            data : JSON.stringify(searchQuery),
            contentType: 'application/json',
            dataType : 'json',
            type: 'POST',
            success: function(data, textStatus, xhr) {
                console.log(data);
                if (typeof callback === 'function') {
                    callback(data);
                }
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR)
            }
        })
    };


    return {
        addAlbum : addAlbumElastic,
        addElastic: addElastic,
        deleteElastic: deleteElastic,
        getElastic : getElastic
    }
})