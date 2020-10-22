import Router from 'koa-router';

import { checkLoggedIn, checkPostObjectId, checkOwnPost } from '../../lib/checkMiddleware';
import * as postsCtrl from './posts.ctrl';

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', checkLoggedIn, postsCtrl.write);
posts.get('/:id', checkPostObjectId, postsCtrl.read);
posts.patch('/:id', checkLoggedIn, checkPostObjectId, checkOwnPost, postsCtrl.update);
posts.delete('/:id', checkLoggedIn, checkPostObjectId, checkOwnPost, postsCtrl.remove);

export default posts;
