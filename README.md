# partos-pat
Power Awarness Tool

[![Coverage Status](https://coveralls.io/repos/github/akvo/partos-pat/badge.svg?branch=main)](https://coveralls.io/github/akvo/partos-pat?branch=main) [![DBdocs](https://img.shields.io/website?url=http%3A%2F%2Fdbdocs.io%2Fakvo%2Fpartos-pat&style=flat&logo=docsdotrs&logoColor=%23fff&label=dbdocs&labelColor=%230246cc&color=%235e5e5e&link=http%3A%2F%2Fdbdocs.io%2Fakvo%2Fpartos-pat)](https://dbdocs.io/akvo/partos-pat)

## Environment Setup

1. Copy the `.env.example` file:
   ```
   cp .env.example .env
   ```

2. Set the desired values for the following variables:
   ```
   MAILJET_APIKEY=YOUR_MAILJET_API_KEY
   MAILJET_SECRET=YOUR_MAILJET_SECRET
   WEBDOMAIN="<<full site URL (default: http://localhost:3000)>>"
   ```