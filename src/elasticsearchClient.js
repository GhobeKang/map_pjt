/**
 * Created by Ghobe on 2018-01-18.
 */
window.define(['elasticsearch','jquery'], function(elastic, $){

    function make_default_auth(user, pass) {
        var tok = user + ':' + pass;
        var hash = btoa(tok);
        return 'Basic ' + hash;
    }

    var addAlbumElastic = function(userID, json) {
        var url = 'https://18.221.145.44:9200/albums/albumInfo/';

        $.ajax({
            async: true,
            crossDomain: true,
            url: url,
            data: JSON.stringify(json),
            contentType: 'application/json',
            dataType: 'json',
            method: 'POST',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', make_default_auth('elastic', 'changeme'))
            },
            success: function(data, textStatus, xhr) {
                console.log(data);
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR);
            }
        })
    };

    var addElastic = function(albumNum, position, value, where, isUpdate, userID) {
        var url;
        var insertJson;

        if (where === 'caption') {
            insertJson = {
                userid : userID,
                albumNum : albumNum,
                position : position,
                caption : value
            }
        }else if (where === 'tag') {
            insertJson = {
                userid : userID,
                albumNum : albumNum,
                position : position,
                tag : value
            }
        }

        if (isUpdate) {
            url = 'https://18.221.145.44:9200/albums/subInfo/_update_by_query';
            if (where === 'caption') {
                insertJson = {
                    script : {
                        lang : "painless",
                        source : "ctx._source.caption = '"+value+"'"
                    },
                    query : {
                        bool : {
                            must : [{match : { userId : userID }},
                                {match : { albumNum : albumNum }},
                                {match : { position : position }}]
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
                            must : [{match : { userId : userID }},
                                {match : { albumNum : albumNum }},
                                {match : { position : position }}]
                        }
                    }
                }
            }
        }else {
            url = 'https://18.221.145.44:9200/albums/subInfo/';
        }


        $.ajax({
            async: true,
            crossDomain: true,
            url: url,
            data: JSON.stringify(insertJson),
            contentType: 'application/json',
            dataType: 'json',
            method: 'POST',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', make_default_auth('elastic', 'changeme'))
            },
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
            url : 'https://18.221.145.44:9200/'+index+'/',
            method: 'DELETE',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', make_default_auth('elastic', 'changeme'))
            },
            success: function(data, textStatus, xhr) {
                console.log(data);
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR)
            }
        })
    };

    var deleteAlbumElastic = function(albumNum, userid) {
        var query = {
            query : {
                bool : {
                    must :
                        [
                            {match : {albumNum : albumNum}},
                            {match : {userid : userid}}
                        ]
                }
            }
        };

        var url = 'https://18.221.145.44:9200/albums/_delete_by_query';

        $.ajax({
            async: true,
            crossDomain: true,
            url: url,
            data: JSON.stringify(query),
            contentType: 'application/json',
            dataType: 'json',
            method: 'POST',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', make_default_auth('elastic', 'changeme'))
            },
            success: function(data, textStatus, xhr) {
                console.log(data);
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR);
            }
        })
    };

    var searchImage = function(searchString, userid, position, caption, tag, callback) {
        var searchQuery ={
            query : {
                bool: {
                    must :
                        [
                            {match : {userid : userid}},
                            // {match : {position : position}},
                            {match : {albumNum : searchString}}
                        ]
                }
            }
        };

        $.ajax({
            async: true,
            crossDomain: true,
            processData : false,
            url : 'https://18.221.145.44:9200/albums/albumInfo/_search/?filter_path=hits.hits._source',
            data : JSON.stringify(searchQuery),
            contentType: 'application/json',
            dataType : 'json',
            type: 'POST',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', make_default_auth('elastic', 'changeme'))
            },
            success: function(data, textStatus, xhr) {
                console.log(data);
                if (typeof callback === 'function') {
                    callback(data, position, caption, tag);
                }
            },
            error: function(jqXHR, textStatus, errorTrown) {
                console.log(errorTrown, jqXHR)
            }
        });



    };
    var getElastic = function(searchString, userid, callback) {

        var searchQuery = {
            query : {
                bool: {
                    must :
                        [
                            {match : {userid : userid}},
                            {match : {tag : searchString}}
                        ]
                }
            }
        };


        $.ajax({
            async: true,
            crossDomain: true,
            processData : false,
            url : 'https://18.221.145.44:9200/albums/subInfo/_search/?filter_path=hits.hits._source',
            data : JSON.stringify(searchQuery),
            contentType: 'application/json',
            dataType : 'json',
            type: 'POST',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', make_default_auth('elastic', 'changeme'))
            },
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
        searchImage : searchImage,
        addAlbum : addAlbumElastic,
        addElastic: addElastic,
        deleteElastic: deleteElastic,
        delAlbum : deleteAlbumElastic,
        getElastic : getElastic
    }
})