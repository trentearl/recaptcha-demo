import koa from "koa";
import bodyParser from 'koa-bodyparser'
import axios from 'axios';
import fs from "fs";

import cors from "@koa/cors";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const {
  GOOGLE_SITE_KEY,
  GOOGLE_API_KEY,
  GOOGLE_PROJECT_ID,
} = process.env;

const HTML = fs.readFileSync('index.html', 'utf8')
  .toString()
  .replace(/GOOGLE_SITE_KEY/g, GOOGLE_SITE_KEY!)
  .replace(/GOOGLE_PROJECT_ID/g, GOOGLE_PROJECT_ID!);


const app = new koa();

app.use(cors());
app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err.message);
    ctx.body = err.message;
  }
});

const API_URL = 'https://recaptchaenterprise.googleapis.com/v1/projects/' + GOOGLE_PROJECT_ID + '/assessments?key=' + GOOGLE_API_KEY;

app.use(async (ctx) => {
  if (ctx.method !== 'POST') {
    ctx.body = HTML;
    ctx.status = 200;
    return;
  }

  const body = {
    event: {
      // @ts-ignore
      token: ctx.request.body.token,
      siteKey: GOOGLE_SITE_KEY,
      expectedAction: 'LOGIN',
    }
  };

  const res = await axios.post(API_URL, body)
  console.log(res.data);

  ctx.body = res.data;
  ctx.status = res.status;
})


app.listen(Number(PORT), HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
})
