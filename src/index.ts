import dotenv from 'dotenv';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import mongoose from 'mongoose';

import api from './api';
import jwtMiddleware from './lib/jwtMiddleware';

// .env에서 환경 변수 가져오기
dotenv.config();
const { PORT, MONGO_URI } = process.env;

// DB 연결
(async function () {
  try {
    await mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/coverbymeDB', {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (e) {
    console.error(e);
  }
})();

const app = new Koa();
const router = new Router();

router.use('/api', api.routes());

// request의 body를 받기 위해서 bodyParser 추가
app.use(bodyParser());

app.use(jwtMiddleware);

app.use(router.routes());

const port = PORT || 4000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
