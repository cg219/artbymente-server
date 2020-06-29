const request = require('supertest');
const app = require('./../index');
let response;
let slug;

beforeAll(() => console.log('Testing Started'));
afterAll(() => {
    app.close();
    console.log('Testing Completed');
});

describe('Test All Posts', () => {

    beforeAll(async () => {
        response = await request(app).get('/api/art');
    })

    test('check if posts exists', () => {
        expect(response.body).toHaveProperty('status');
    })
})
