'use strict'

require('array.prototype.flatmap').shim()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200'
})

const prettifiedData = require('../data/formatted_data.json')


async function run() {
  await client.indices.create({
    index: 'sinhala_poems',
    body: {
      "settings": {
        "analysis": {
          "analyzer": {
            "my_analyzer": {
              "type": "custom",
              "tokenizer": "icu_tokenizer",
              "filter": ["customNgramFilter", "customStopWordFilter"]
            }
          },
          "filter": {
            "customNgramFilter": {
              "type": "edge_ngram",
              "min_gram": "4",
              "max_gram": "18",
              "side": "front"
            },
            "customStopWordFilter": {
              "type": "stop",
              "ignore_case": true,
              "stopwords": ["ගත්කරු", "රචකයා", "ලියන්නා", "ලියන", "රචිත", "ලියපු", "ලියව්‌ව", "රචනා", "රචක", "ලියන්", "ලිවූ", "ගායකයා", "ගයනවා", "ගායනා", "ගායනා", "ගැයු", "ගයන", "කිව්", "කිවු", "සංගීත", "සංගීතවත්", "සංගීතය", "වර්ගය", "වර්‍ගයේ", "වර්ගයේම", "වර්ගයේ", "වැනි", "ඇතුලත්", "ඇතුලු", "විදියේ", "විදිහේ", "හොඳම", "ජනප්‍රිය", "ප්‍රචලිත", "ප්‍රසිද්ධම", "හොදම", "ජනප්‍රියම", "ලස්සනම", "ගීත", "සිංදු", "ගී", "සින්දු"]
            }
          }
        }
      },
      "mappings": {
        "properties": {
          "Poet": {
            "type": "text",
            // "fields": {
            //   "raw": {
            //     "type": "keyword"
            //   }
            // },
            "analyzer": "my_analyzer"
          },
          // "shares": { "type": "integer" },
          "Poem name": { "type": "text", "analyzer": "my_analyzer" },
          "Line": { "type": "text", "analyzer": "my_analyzer" },
          "Metaphor present or not": {
            "type": "text",
            // "fields": {
            //   "raw": {
            //     "type": "keyword"
            //   }
            // },
            "analyzer": "my_analyzer"
          },
          "Count of the metaphor": { "type": "integer" },
          "Metaphorical terms": { "type": "text" ,"analyzer": "my_analyzer"},
          "Source domain": { "type": "text" ,"analyzer": "my_analyzer"},
          "Target domain": {
            "type": "text",
            // "fields": {
            //   "raw": {
            //     "type": "keyword"
            //   }
            // },
            "analyzer": "my_analyzer"
          },
          "Meaning": {
            "type": "text",
            // "fields": {
            //   "raw": {
            //     "type": "keyword"
            //   }
            // },
            "analyzer": "my_analyzer"
          },
          "Year": { "type": "text" ,"analyzer": "my_analyzer"},
          // "composer": {
          //   "type": "text",
          //   "fields": {
          //     "raw": {
          //       "type": "keyword"
          //     }
          //   },
          //   "analyzer": "my_analyzer"
          // },
          // "movie": {
          //   "type": "text",
          //   "fields": {
          //     "raw": {
          //       "type": "keyword"
          //     }
          //   },
          //   "analyzer": "my_analyzer"
          // }
        }
      }
    }
  }, { ignore: [400] })

  const dataset = prettifiedData;

  const body = dataset.flatMap(doc => [{ index: { _index: 'sinhala_poems' } }, doc])

  const { body: bulkResponse } = await client.bulk({ refresh: true, body })

  if (bulkResponse.errors) {
    const erroredDocuments = []
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        erroredDocuments.push({
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

  const { body: count } = await client.count({ index: 'sinhala_poems' })
  console.log(count)
}

run().catch(console.log)