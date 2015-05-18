var Crawler = require("crawler");
var Chance = require('chance');

// Instanciations
var cr = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, result, $) {
        var domain=result.uri.substring(result.uri.lastIndexOf("=")+1,result.uri.lastIndexOf("."));
        if (result.body == -1) {
            console.log(domain + ".com is available!");
        }
    }
});
var ch = new Chance();

// Number of tries
var chances = 100;
// Domain options
var domain_options= {length:5};

for (var i = 0; i < chances; i++) {

    var domain_candidate = ch.word(domain_options);
    cr.queue("http://www.domainnamesoup.com/cell.php?domain="+domain_candidate+".com");
}
