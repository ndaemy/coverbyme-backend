import Router from 'koa-router';

import { checkLoggedIn, checkObjectId } from '../../lib/checkMiddleware';
import * as postsCtrl from './posts.ctrl';

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', checkLoggedIn, postsCtrl.write);
posts.get('/:id', checkObjectId, postsCtrl.read);

export default posts;
