const supertest = require('supertest')
const serverUrl = "localhost:8081"
let request = require('supertest')
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
request = request(serverUrl); 
describe('POST /register', () => {

    it('POST /register with no body must throw a bad request', async() => {
      const res = await request.post('/register')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      
  })

    it('POST /register void username and password sends back 400 bad Request', async() => {
      const credenziali = {
        email: "andrea@gmail.it",
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
      email: "andrea@salvuccimail.it",
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

it('POST /register void email sends back 400 Bad Request', async() => {
  const credenziali = {
    email: "",
    username: "username",
    password: "123"
  }
  const res = await request.post('/register')
  .set('Accept', 'application/json')
  .send(credenziali)
  .expect('Content-Type', /json/)
  .expect(400)
   expect(res.body.message).toBe("Email must not be blank")
  
})
it('POST /register not valid email sends back 400 Bad Request', async() => {
  const credenziali = {
    email: "andrea@.it",
    username: "username",
    password: "123"
  }
  const res = await request.post('/register')
  .set('Accept', 'application/json')
  .send(credenziali)
  .expect('Content-Type', /json/)
  .expect(400)
   expect(res.body.message).toBe("Not a valid email")
  
})

it('POST /register void password sends back 400 Bad Request', async() => {
  const credenziali = {
    email: "andrea@salvuccimail.it",
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
    var suffissoRandom = Math.floor(Math.random() * 1000000)
    emailCreata = "andrea.salvuccimail"+suffissoRandom+"@salvuccimail.it"
    const credenziali = {
      email: emailCreata,
      username: "asalvucci2",
      password: "Dioporco123!"
    }
    const res = await request.post('/register')
    
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(409)
    expect(res.body.message).toBe('An account with that e-mail address or username already exists!')
  })

  it('POST /register email already exists', async() => {
    const credenziali = {
      email: "andrea@miaemailspeciale.it",
      username: "nuovousernamediverso2",
      password: "Dioporco123!"
    }
    const res = await request.post('/register')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(409)
    expect(res.body.message).toBe('An account with that e-mail address or username already exists!')
    
})

  it('POST /register password too short', async()=>{
    const credenziali = {
      email: "andrea@salvuccimail.it",
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
      email: "andrea@salvuccimail.it",
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
      email: "andrea@salvuccimail.it",
      username: "johndoe24",
      password: "password"
    }
    const res = await request.post('/register')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    expect(res.body.message).toBe("Username or password not properly formatted")
  })
  })