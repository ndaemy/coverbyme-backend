import Router from 'koa-router';

import checkLoggedIn from '../../lib/checkLoggedIn';
import * as postCtrl from './posts.ctrl';

const posts = new Router();

posts.post('/', checkLoggedIn, postCtrl.write);

export default posts;
