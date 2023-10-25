"use strict";

const express = require("express");
const router = express.Router();

const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://localhost:9200" });

var keywords = require("../../data/keywords.json");
// var named_entities = require("../../data/named_entities.json");  
 
router.post("/", async function (req, res) { 
  var query = req.body.query;
  var query_words = query.trim().split(" ");
  var removing_query_words = [];
  var size = 100;
  var field_type = ""; 
  var b_poet = 1;
  var b_poemName = 1;
  var b_book = 1;
  var b_year = 1;
  var b_line = 1;
  var b_metophorMeaning = 1;
  var b_metorphorTerms = 1;
  var b_sourceDomain = 2;
  var b_targetDomain = 1;
  var b_metaphorPresentOrNot = 1;
  var b_count = 1;
  var b_poemNo = 1;
  var metophor = false;
  var b_unformatted_lyrics = 1;
  var sorting = 0;
  var range = 0;
  var sort_method = [];

  if (query_words.length > 8) { 
   // b_unformatted_lyrics = b_unformatted_lyrics + 2;
    field_type = "best_fields";
  } else {
    field_type = "cross_fields"; 

    query_words.forEach((word) => {
      word = word.replace("ගේ", "");
      word = word.replace("යන්ගේ", "");

    //   if (named_entities.writer_names.includes(word)) {
    //     b_poet = b_poet + 1;
    //   }
  
      if (keywords.write.includes(word)) {
        b_poet = b_poet + 1;
        removing_query_words.push(word);
      }
      if (keywords.metorphor.includes(word)) {
        metophor = true;
        removing_query_words.push(word);
  
      }
      if (keywords.poem.includes(word)) {
        removing_query_words.push(word);
      }

      if (keywords.sorting.includes(word)) {
        sorting = sorting + 1;
        removing_query_words.push(word);
      }
      let numbersArray = word.match(/\d+/g);
      if (numbersArray) {
        console.log(word);
        range = parseInt(numbersArray[0]);
        removing_query_words.push(word);
      }
    });
  }
  if (range == 0 && sorting > 0) {
    size = 10;
    sort_method = [{ count: { order: "desc" } }];
  } else if (range > 0 || sorting > 0) {
    size = range;
    sort_method = [{ count: { order: "desc" } }];
  }
  console.log("2", removing_query_words);
  removing_query_words.forEach((word) => {
    query = query.replace(word, "");
  });
  console.log("1", query);

  var result = await client.search({ 
    index: "index_sinhala_poems",
    body: { 
      size: size,
      _source: {
    
        includes: [
            "Metaphorical terms",
            "Source domain",
            "Target domain",
            "Line",
            "Poet",
            "year",
            "Book",
            "Poem name",
            "Meaning",
            "Metaphor present or not",
            "Count of the metaphor",
          ],
      },
      sort: sort_method,
      query: {
        bool: {
          must: [ 
            {
              multi_match: {
                query: query.trim(),
                fields: [
                  `Poet^${b_poet}`,
                  `Metaphorical terms^${b_metorphorTerms}`,
                  `Source Domain^${b_sourceDomain}`,
                  `Target Domain^${b_targetDomain}`,
                  `Line^${b_line}`,
                  `Poem name^${b_poemName}`,
                  `Book^${b_book}`,
                  `year^${b_year}`,
                  `Meaning^${b_metophorMeaning}`,
                ],
                operator: "or",
                type: field_type,
              },
            },
            metophor
               ? {
                  range: {
                    'Count of the metaphor': {
                      gt: 0,
                    },
                  },
                }
              : {
                  match_all: {},
                },
          ],
        },
      },
      aggs: {
        poem_filter: {
          terms: {
            field: "Poem name.keyword", 
            size: 10
          }
        },
        year_filter: {
          terms: {
            field: "year.keyword", 
            size: 10
          }
        },
        poet_filter: {
          terms: {
            field: "Poet.keyword", 
            size: 10
          }
        },
        book_filter: {
          terms: {
            field: "Book.keyword", 
            size: 10
          }
        }
      }
      
    },
  });

  res.send({
    aggs: result.body.aggregations,
    hits: result.body.hits.hits,
  });
});

module.exports = router;