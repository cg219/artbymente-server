const request = require('supertest');
const app = require('./../index');
let response;
let slug;

beforeAll(() => console.log('Testing Started'));
afterAll(() => {
    app.close();
    console.log('Testing Completed');
});

describe('Test All Artworks', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/artworks');
    })

    test('check if posts exists', () => {
        expect(response.body).toHaveProperty('data');
    })
})

describe('Test Single Artworke', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/artworks');

        let slug = response.body.data[0].slug;

        response = await request(app).get(`/api/artworks/${slug}`);
    })

    test('check if data exists', () => {
        expect(response.body).toHaveProperty('data');
    })
})
