import Koa from 'koa';
const app = new Koa();

import { koaBody } from 'koa-body';
app.use(koaBody({ multipart: true, urlencoded: true, json: true }));

import { router } from './router/index.mjs';
app.use(router.routes());
app.use(router.allowedMethods());

import { connectToDatabase } from './db/db.mjs';
connectToDatabase();

import { PORT } from './constants.mjs';

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
