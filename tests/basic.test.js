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
    expect(res.status).toBe(200)
  })

  it('Gets the / endpoint and receives a timestamp', async () => {
    // Sends GET Request to /test endpoint
    const res = await request.get('/')
    expect(res.status).toBe(200)
    expect(res.body.timestamp).toBeDefined();
  })

})
  

  describe('POST /register', () => {

    it('POST /register void username and password sends back 400 bad Request', async() => {
      const credenziali = {
        username: "",
        password: "123"
      }
      const res = await request.post('/register')
      .set('Accept', 'application/json')
      .send(credenziali)
      .expect('Content-Type', /json/)
      .expect(400)
       expect(res.body.message).toBe("Username or password not properly formatted")
      
  })

  it('POST /register void username sends back 400 Bad Request', async() => {
    const credenziali = {
      username: "",
      password: "123"
    }
    const res = await request.post('/register')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(400)
     expect(res.body.message).toBe("Username or password not properly formatted")
    
})

it('POST /register void password sends back 400 Bad Request', async() => {
  const credenziali = {
    username: "johndoe",
    password: ""
  }
  const res = await request.post('/register')
  
  .set('Accept','application/json')
  .send(credenziali)
  .expect('Content-Type', /json/)
  .expect(400)
   expect(res.body.message).toBe("Username or password not properly formatted")
  
})

  it('POST /register username already exists', async() =>{
    const credenziali = {
      username: "asalvucci2",
      password: "Dioporco123!"
    }
    const res = await request.post('/register')
    
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(409)
    expect(res.body.message).toBe('Username already exists')
  })


  it('POST /register password too short', async()=>{
    const credenziali = {
      username: "johndoe",
      password: "123"
    }
    const res = await request.post('/register')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    expect(res.body.message).toBe("Username or password not properly formatted")
  })

  it('POST /register password too long (over 24 characters', async()=>{
    const credenziali = {
      username: "johndoe",
      password: "1234567890123456789012345"
    }
    const res = await request.post('/register')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    expect(res.body.message).toBe("Username or password not properly formatted")
  })

  it('POST /register password too weak', async()=>{
    const credenziali = {
      username: "johndoe24",
      password: "password"
    }
    const res = await request.post('/register')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    expect(res.body.message).toBe("User not successfully created")
  })

  })

  

  describe('POST /login', () =>{

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
        username: "asalvucci2",
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
        username: "asalvucci2",
        password: "Dioporco123!"
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




  



