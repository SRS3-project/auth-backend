

const supertest = require('supertest')
const app = require('../src/server.js')
const request = supertest(app)
const mocha = require('mocha')
const firestore = require('./../utils/firestore');



  it('Gets the / endpoint', async () => {
    // Sends GET Request to /test endpoint
    const res = await request.get('/')

    expect(res.status).toBe(200)
  })

  it('Gets the / endpoint and receives a timestamp', async () => {
    // Sends GET Request to /test endpoint
    const res = await request.get('/')

    expect(res.status).toBe(200)

    expect(res.body.timestamp).toBeDefined();
  })

  it('post username and password /register', async() => {
      const res = await request.post('/register')
      .auth('','')
      .set('Accept','application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      
  })

  it('username already exists', async() => {
    const res = await request.post('/register')
    .auth('asalvucci2','prova')
    .set('Accept','application/json')
    .expect('Content-Type', /json/)
    .expect(409)
    
})
  



