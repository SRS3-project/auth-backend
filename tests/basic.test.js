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

    it('POST /register void username and password', async() => {
      const res = await request.post('/register')
      .auth('','')
      .set('Accept','application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      
  })

  it('POST /register void username', async() => {
    const credenziali = {
      username: "",
      password: "123"
    }
    const res = await request.post('/register')
    
    .set('Accept','application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(401)
    
})

it('POST /register void password', async() => {
  const credenziali = {
    username: "johndoe",
    password: ""
  }
  const res = await request.post('/register')
  
  .set('Accept','application/json')
  .send(credenziali)
  .expect('Content-Type', /json/)
  .expect(401)
  
})

  it('POST /register username already exists', async() =>{
    const credenziali = {
      username: "asalvucci2",
      password: "qualsiasi"
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
    expect(res.body.message).toBe('Password should be at least 8 characters long')
  })

  })

  

  describe('POST /login', () =>{
    it(' POST /login void password', async() => {
      const credenziali = {
        username: "johndoe",
        password: ""
      }
      const res = await request.post('/login')
      
      .set('Accept','application/json')
      .send(credenziali)
      .expect(400)
      
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
      expect(res.body.message).toBe('Wrong username or password')
      
    })

    it('POST /login right username and password', async() => {
      
      const credenziali = {
        username: "asalvucci2",
        password: "Dioporco123!"
      }
      const res = await request.post('/login')
      
      .set('Accept','application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    })
    
    


  })




  



