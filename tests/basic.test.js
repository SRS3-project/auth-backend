const supertest = require('supertest')
const serverUrl = "localhost:8081"
let request = require('supertest')
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}



request = request(serverUrl); 
describe('GET /', () =>{
   
  it('Gets the / endpoint', async () => {
    // Sends GET Request to /test endpoint
    const res = await request.get('/')
    expect(res.status).toBe(404)
  })

})
  

  

  




  



