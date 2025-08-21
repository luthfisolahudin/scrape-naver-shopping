# Scrape Naver Shopping

## How to Setup

First clone this repository,

```sh
git clone git@github.com:luthfisolahudin/scrape-naver-shopping.git
```

Then, setup your proxy by creating new `.env` file and fill you proxy credentials. You can start by copy from `.env.example` file.

## How to Run

To run this project, you required to have working Docker. Then, run the command below to build and run.

```sh
docker build --tag "luthfisolahudin-scrape-naver-shopping" .
docker run --detach --publish 3000:3000 "luthfisolahudin-scrape-naver-shopping"
```

After running the command, this project will run and listen at port 3000.

## How to Use

Visit localhost port 3000, or other port this project run at. Then add `/naver/` and your naver URL.
Example URL format: `http://localhost:3000/naver/https://search.shopping.naver.com/...`

> This project only allow `search.shopping.naver.com`. It will refuse when sending other hostname.

## Technologies Used for Scrapping

This project:
- Use Playwright + Playwright Extra + Plugin Stealth to mimic usual browser activities.
- Use Korean locale and Timezone ID.
- Can change browser viewport per request.
- Can scrape public free Korean proxy some several sources or use premium proxy to help being seen as Korean users.
- Use request queueing to help prevent getting rate-limited.
