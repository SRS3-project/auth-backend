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
      .expect(401)
       expect(res.body.message).toBe("Unauthorized")
      
  })

  it('POST /resetpassword with token too short must throw 401 Unauthorized', async() => {
    var token="abc"
    const res = await request.post('/resetpassword?token='+token)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401)
     expect(res.body.message).toBe("Unauthorized")
    
})

it('POST /resetpassword with token not found throws 401 Unauthorized', async() => {
    var token="fd0dd440658ad7bdf4b2e02978a419ebd7efbc651f0e9f3a7d883f18e5715390"
    const res = await request.post('/resetpassword?token='+token)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401)
     expect(res.body.message).toBe("Unauthorized")
    
})

it('POST /resetpassword with token found and valid sends back 200 OK', async() => {
    var token="fd0ddf70658ad7bdf4b2e02978a419ebd7efbc651f0e9f3a7d883f18e5715390"
    const res = await request.post('/resetpassword?token='+token)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    
})
  })