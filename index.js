const credentials = require('./credentials');
const ContentfulAPI = require('contentful');
const Koa = require('koa');
const KoaRouter = require('@koa/router');
const KoaBody = require('koa-bodyparser');
const KoaJSON = require('koa-json');
const KoaCORS = require('@koa/cors');
const path = require('path');
const PORT = credentials.PORT;
const app = new Koa();
const router = new KoaRouter();
const contentful = ContentfulAPI.createClient({
    space: credentials.CONTENTFUL_SPACE,
    accessToken: credentials.CONTENTFUL_ACCESS_TOKEN
});

router.get('/api/art', async ctx => {
    try {
        const raw = await contentful.getEntries({
            content_type: 'artwork',
            order: '-fields.date'
        })

        const artworks = raw.items.map(artwork => {
            return {
                ...artwork.fields,
                image: {
                    url: artwork.fields.image.fields.file.url,
                    filename: artwork.fields.image.fields.file.fileName
                }
            }
        })

        ctx.body = { status: 200, items: artworks }
    } catch (error) {
        ctx.body = { status: 400, error }
    }
})

app
    .use(KoaCORS())
    .use(KoaBody())
    .use(KoaJSON())
    .use(router.routes())
    .use(router.allowedMethods());

const server = app.listen(PORT);

console.log(`Running on Port: ${PORT}`);

module.exports = server;
