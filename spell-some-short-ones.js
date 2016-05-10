var Crawler = require("crawler");
var Chance = require('chance');
var Thesaurus = require('thesaurus');
var Say = require('say');
var Filesystem = require('fs');

/**
 *  Config options here
 */
// Number of tries
var chances = 100;
// Domain options
var domain_options = {length:3, searchThesaurus:true}; // Not much left of 2-letter domain names with 2-letter TLDs in 2016
/* end config options */

/**
 *  Instanciations
 */
var cr = new Crawler({
    maxConnections : chances, // Becomes one if 'reateLimits is set'
    rateLimits: 2000, // Acceptable delay in milliseconds between each requests to be polite with GoDaddy
    skipDuplicates: true,
    cache: true,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/50.0.2661.94 Safari/537.36",
    // At the end
    onDrain: function() {
        var lastWords = "That\'s all, folks!";
        console.log(lastWords);
        // Let finish the last piece of speech
        setTimeout(function(){
            Say.speak('Deranged', lastWords);
            process.exit();
        }, 3000);
    },
    // This will be called for each crawled page
    callback : function (error, result, $) {

        // Filter unnecessary info
        try {
            var jsonPayload = JSON.parse(result.body);
            var domain = jsonPayload.ExactMatchDomain.NameWithoutExtension;
            var extension = jsonPayload.ExactMatchDomain.Extension;
            var isAvailable = jsonPayload.ExactMatchDomain.IsAvailable;
            var isPurchasable = jsonPayload.ExactMatchDomain.IsPurchasable;
            var currentPrice = jsonPayload.Products[0].PriceInfo.CurrentPrice;

            // console.log("[Debug] " + domain + "." + extension + " available? " + ((isAvailable) ? "Yes" : "No") + ", " +
            //    "can buy? " + ((isPurchasable) ? "Yes" : "No"));

            if (isAvailable && isPurchasable) {
                console.log("≧◠‿◠≦✌ Hurray: " + domain + "." + extension + " is available for $" + currentPrice + "!");
                // Try to reduce overlap of speech even though asynchronous
                setTimeout(function () {
                    // Pronunce as a whole including the extension
                    Say.speak((Math.random() < 0.5 ? 'Victoria' : 'Alex'), domain + extension);
                }, 1000);
                // If we find any thesaurus it's great
                if (domain_options.searchThesaurus) {
                    // Analyse as a whole including the extension
                    var thesaurusArray = th.find(domain + extension);
                    if (thesaurusArray.length > 0) {
                        Say.speak('Hysterical', 'thesaurus found!');
                        console.log("٩(˘◡˘)۶ Thesaurus found: " + thesaurusArray);
                    }
                }
            }
        } catch (e) {
             //console.log("[Error] "+e);
            console.log("API says: (◣◢)┌∩┐");
        }
    }
});
var ch = new Chance();
var th = Thesaurus.load("./th_en_US_new.dat");

/**
 * Unrestricted 2-letter TLDs for commercial use
 * https://en.wikipedia.org/wiki/Country_code_top-level_domains_with_commercial_licenses
 * https://en.wikipedia.org/wiki/GccTLD
 */
// Synchronously load the TLDs to an array
var ccTLDs = Filesystem.readFileSync('ccTLDs.txt').toString().split("\n");

/**
 *  Search loop on GoDaddy API
 */
var count = 0;
for (var i = 0; i < chances; i++) {
    if (count == 0) { // Let's get started!
        Say.speak('Deranged', "Let's get some "+domain_options.length+" letter domain names son!");
        count++;
    }
    var domain_candidate = ch.word(domain_options);

    // Add to crawler queue...
    for (j in ccTLDs) {
        //console.log("[Debug] " + domain_candidate + "." + ccTLDs[j]);
        cr.queue("https://sg.godaddy.com/domainsapi/v1/search/exact?q=" + domain_candidate + "." + ccTLDs[j]);
    }
}