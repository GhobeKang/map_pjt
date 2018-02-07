/**
 * Created by Ghobe on 2018-01-18.
 */
window.define(['elasticsearch','jquery'], function(elastic, $){
    var addAlbumElastic = function(albumNum, json) {
        var url = 'http://18.221.145.44:9200/albums/albumInfo/'+albumNum+'/';

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
            url = 'http://18.221.145.44:9200/albums/_update_by_query';
            if (where === 'caption') {
                insertJson = {
                    script : {
                        lang : "painless",
                        source : "ctx._source.caption = '"+value+"'"
                    },
                    query : {
                        bool : {
                            must : {
                                match : { albumNum : albumNum },
                                match : { position : position }
                            }
                        }
                    }
                }
            }else if (where === 'tag') {
                insertJson = {
                    script : {
                        lang : "painless",
                        source : "ctx._source.tag = '"+value+"'"
                    },
                    query : {
                        bool : {
                            must : {
                                match : { albumNum : albumNum },
                                match : { position : position }
                            }
                        }
                    }
                }
            }
        }else {
            url = 'http://18.221.145.44:9200/albums/subInfo/';
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
            url : 'http://18.221.145.44:9200/'+index+'/',
            method: 'DELETE',
            success: function(data, textStatus, xhr) {
                console.log(data);
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR)
            }
        })
    };

    var deleteAlbumElastic = function(albumNum) {
        var query = {
            query : {
                match : {
                    albumNum : albumNum
                }
            }
        };

        var url = 'http://18.221.145.44:9200/albums/_delete_by_query';

        $.ajax({
            async: true,
            crossDomain: true,
            url: url,
            data: JSON.stringify(query),
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

    var searchImage = function(searchString, position, caption, tag, callback) {
        var searchQuery = {
            query : {
                bool :{
                    must : {
                        term : { albumNum : searchString }
                    },
                    filter : {
                        term : { _type : "albumInfo" }
                    }
                }

            }
        };

        $.ajax({
            async: true,
            crossDomain: true,
            processData : false,
            url : 'http://18.221.145.44:9200/albums/_search/?filter_path=hits.hits._source',
            data : JSON.stringify(searchQuery),
            contentType: 'application/json',
            dataType : 'json',
            type: 'POST',
            success: function(data, textStatus, xhr) {
                if (typeof callback === 'function') {
                    callback(data, position, caption, tag);
                }
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
            url : 'http://18.221.145.44:9200/albums/_search/?filter_path=hits.hits._source',
            data : JSON.stringify(searchQuery),
            contentType: 'application/json',
            dataType : 'json',
            type: 'POST',
            success: function(data, textStatus, xhr) {
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
        searchImage : searchImage,
        addAlbum : addAlbumElastic,
        addElastic: addElastic,
        deleteElastic: deleteElastic,
        delAlbum : deleteAlbumElastic,
        getElastic : getElastic
    }
})