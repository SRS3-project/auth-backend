const supertest = require('supertest')
const serverUrl = "localhost:8081"
let request = require('supertest')
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
request = request(serverUrl); 
 describe('POST /resetpassword', ()=>{
    it('POST /resetpassword with no token must throw 401 Unauthorized', async() => {
      const res = await request.post('/resetpassword')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
       expect(res.body.message).toBe("Login failed: invalid username or password")
      
  })
  })