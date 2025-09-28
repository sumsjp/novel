#!/bin/bash
set -e -E

GEMINI_API_KEY="AIzaSyBzRFKYz309TF"
MODEL_ID="gemini-2.5-flash"
GENERATE_CONTENT_API="streamGenerateContent"

cat << EOF > request.json
{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "請解釋下面文字"
          },
        ]
      },
    ],
    "generationConfig": {
      "thinkingConfig": {
        "thinkingBudget": -1,
      },
    },
}
EOF

GEMINI_API_KEY = "${GEMINI_API_KEY}v6ZmpvCT7LfDY4xVhuLsE"

curl \
-X POST \
-H "Content-Type: application/json" \
"https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}" -d '@request.json'
