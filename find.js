var Crawler = require("crawler");
var Chance = require('chance');
var Thesaurus = require('thesaurus');
var Say = require('say');

/**
 *  Instanciations
 */
var cr = new Crawler({
    maxConnections : chances,
    // At the end
    onDrain: function() {
        console.log("<End of processing>");
        // Let finish the last piece of speech
        setTimeout(function(){
            Say.speak('Deranged', 'That\'s all, folks!');
            process.exit();
        }, 4000);
    },
    // This will be called for each crawled page
    callback : function (error, result, $) {
        var domain=result.uri.substring(result.uri.lastIndexOf("=")+1,result.uri.lastIndexOf("."));

        // TODO: Abstract this out to a stragegy pattern for different services response to be parsed
        if (result.body.indexOf("ComAvailable")!= -1) { // domaintyper.com service parsing
            result.body = JSON.parse(result.body);
            result.body = (result.body.ComAvailable) ? -1 : "Taken";
        }

        if (result.body === -1) {
            console.log(domain + ".com is available!");
            // Try to reduce overlap of speech even though asynchronous
            setTimeout(function(){
                Say.speak((Math.random() < 0.5 ? 'Victoria':'Alex'), domain);
            }, 2000);
            if (domain_options.withThesaurus) {
                var thesaurusArray = th.find(domain);
                if (thesaurusArray.length > 0) {
                    Say.speak('Hysterical', 'thesaurus');
                    console.log("Thesaurus: "+thesaurusArray);
                }
            }
        }
    }
});
var ch = new Chance();
var th = Thesaurus.load("./th_en_US_new.dat");

/**
 *  Setup
 */
// Number of tries
var chances = 100;
// Domain options
var domain_options = {length:5, withThesaurus:true};

/**
 *  Loop
 */
for (var i = 0; i < chances; i++) {
    var domain_candidate = ch.word(domain_options);
    // Alternate randomly between different services
    // TODO: Abstract this into a separate Adapter class essentially to load balance and avoid IP banning if any
    if (Math.random() < 0.5) {
        cr.queue("http://www.domainnamesoup.com/cell.php?domain=" + domain_candidate + ".com");
    } else {
        cr.queue("https://domaintyper.com/DomainCheckHandler.ashx?domain=" + domain_candidate + ".com");
    }
}