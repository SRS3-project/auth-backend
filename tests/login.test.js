const supertest = require('supertest')
const serverUrl = "localhost:8081"
let request = require('supertest')
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
request = request(serverUrl); 
describe('POST /login', () =>{


    it('POST /login with no body must throw a bad request', async() => {
      const res = await request.post('/login')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
       expect(res.body.message).toBe("Login failed: invalid username or password")
      
  })

    it('POST /login void password', async() => {
      const credenziali = {
        username: "johndoe",
        password: ""
      }
      const res = await request.post('/login')
      
      .set('Accept','application/json')
      .send(credenziali)
      .expect(400)
       expect(res.body.message).toBe("Login failed: invalid username or password")
      
    })
    
    it('POST /login void username', async() => {
      const credenziali = {
        username: "",
        password: "123"
      }
      const res = await request.post('/login')
      .set('Accept','application/json')
      .send(credenziali)
      .expect('Content-Type', /json/)
      .expect(400)
      expect(res.body.message).toBe("Login failed: invalid username or password")

    })

    it('POST /login wrong password', async() => {
      const credenziali = {
        username: "asalvuccivero2",
        password: "passwordsbagliata"
      }
      const res = await request.post('/login')
      
      .set('Accept','application/json')
      .send(credenziali)
      .expect('Content-Type', /json/)
      .expect(401)
      expect(res.body.message).toBe("Login failed: invalid username or password")
      
    })

    it('POST /login right username and password', async() => {
      
      const credenziali = {
        username: "utenteFinto6",
        password: "Test123!"
      }
      const res = await request.post('/login')
      
      .set('Accept','application/json')
      .send(credenziali)
      .expect('Content-Type', /json/)
      .expect(200)
       expect(res.body.username).toBeDefined()
       expect(res.body.accessToken).toBeDefined()
       expect(res.body.roles).toBeDefined();
    })
  })

  it('POST /login deleted user login fails', async() => {
      
    const credenziali = {
      username: "utenteFinto7",
      password: "Test123!"
    }
    const res = await request.post('/login')
    
    .set('Accept','application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(400)
  })
