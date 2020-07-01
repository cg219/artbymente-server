const credentials = require("./credentials");
const ContentfulAPI = require("contentful");
const Koa = require("koa");
const KoaRouter = require("@koa/router");
const KoaBody = require("koa-bodyparser");
const KoaJSON = require("koa-json");
const KoaCORS = require("@koa/cors");
const path = require("path");
const PORT = credentials.PORT;
const app = new Koa();
const router = new KoaRouter();
const contentful = ContentfulAPI.createClient({
    space: credentials.CONTENTFUL_SPACE,
    accessToken: credentials.CONTENTFUL_ACCESS_TOKEN
});

const errorResponse = (ctx, error) => {
    ctx.body = { status: 400, error }
}

const transformResponse = raw => {
    return {
        ...raw.fields,
        image: {
            url: raw.fields.image.fields.file.url,
            filename: raw.fields.image.fields.file.fileName
        }
    }
}

const getRelated = async tags => {
    const raw = await contentful.getEntries({
        content_type: "artwork",
        "fields.tags[in]": tags.join(','),
        select: "fields.image,fields.nsfw,fields.slug",
        limit: 9
    });

    const related = raw.items.map(art => transformResponse(art));
    let returnValue = related;;

    if (related.length < 9) {
        const ignore = related.map(art => art.slug);
        const limit = 9 - related.length;

        const remainingRaw = await contentful.getEntries({
            content_type: "artwork",
            "fields.slug[nin]": ignore.join(','),
            select: "fields.image,fields.nsfw,fields.slug",
            limit
        })

        const remainingRelated = remainingRaw.items.map(art => transformResponse(art));

        returnValue = [...related, ...remainingRelated];
    }

    return returnValue;
}

router.get("/api/artworks", async ctx => {
    try {
        const raw = await contentful.getEntries({
            content_type: "artwork",
            order: "-fields.date"
        })

        const artworks = raw.items.map(art => transformResponse(art));

        ctx.body = { status: 200, data: artworks }
    } catch (error) {
        errorResponse(cta, error);
    }
})

router.get("/api/artworks/:slug", async ctx => {
    try {
        const raw = await contentful.getEntries({
            content_type: "artwork",
            "fields.slug": ctx.params.slug
        })

        const artwork = raw.items.map(art => transformResponse(art))[0];
        const related = await getRelated(artwork.tags);
        artwork.related = related;

        ctx.body = { status: 200, data: artwork }
    } catch (error) {
        errorResponse(ctx, error);
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
