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
    expect(res.body.message).toBe('Username already exists')
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
    expect(res.body.message).toBe('An account with that e-mail address already exists!')
    
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


  describe('POST /forgotpassword', ()=>{

    it('POST /register with no body must throw a bad request', async() => {
      const res = await request.post('/forgotpassword')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
       expect(res.body.message).toBe("E-mail field must not be blank")
      
  })

    it('POST /forgotpassword blank email', async()=>{
      const credenziali = {
        email: ""
      }
      const res = await request.post('/forgotpassword')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(400)
    expect(res.body.message).toBe("E-mail field must not be blank")

    })

    it('POST /forgotpassword email missing domain', async()=>{
      const credenziali = {
        email: "johndoe24@gmail"
      }
      const res = await request.post('/forgotpassword')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(400)
    expect(res.body.message).toBe("Not a valid e-mail address")

    })

    it('POST /forgotpassword email missing server', async()=>{
      const credenziali = {
        email: "johndoe24"
      }
      const res = await request.post('/forgotpassword')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(400)
    expect(res.body.message).toBe("Not a valid e-mail address")

    })

    it('POST /forgotpassword email trovata manda 200', async()=>{
      const credenziali = {
        email: "andrea@nuovamiasemailspeciale.it"
      }
      const res = await request.post('/forgotpassword')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(200)
    expect(res.body.message).toBe("If that e-mail is in our database, we will send a link to reset your password")
    })


  })



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




  



