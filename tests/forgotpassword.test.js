const supertest = require('supertest')
const serverUrl = "localhost:8081"
let request = require('supertest')
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
request = request(serverUrl); 

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

    it('POST /forgotpassword e-mail found sends back  200 OK', async()=>{
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


  describe('PUT /forgotpassword', ()=>{

    it('PUT /forgotpassword no params sends back 404', async()=>{
      const credenziali = {
        token: "2368fceb94c82ebff3985df5c1db8f26032c718b671880e5677e9081e7f61dda",
        newPassword: "NuovaPassword444!"
      }
      const res = await request.put('/forgotpassword/')
    .send(credenziali)
    .expect(404)
    })

    it('PUT /forgotpassword email in req not valid', async()=>{
      const credenziali = {
        token: "2368fceb94c82ebff3985df5c1db8f26032c718b671880e5677e9081e7f61dda",
        newPassword: "NuovaPassword444!"
      }
      const res = await request.put('/forgotpassword/emailnonvalida')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(400)
    expect(res.body.message).toBe("Parameters are not valid")
    })

    it('PUT /forgotpassword email does not exist sends back 401 Unauthorized', async()=>{
      const credenziali = {
        token: "2368fceb94c82ebff3985df5c1db8f26032c718b671880e5677e9081e7f61dda",
        newPassword: "NuovaPassword444!"
      }
      const res = await request.put('/forgotpassword/fintaemail@miaemail.com')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(401)
    expect(res.body.message).toBe("Unauthorized")
    })

    it('PUT /forgotpassword token does not exist sends back 401 Unauthorized', async()=>{
      const credenziali = {
        token: "2368fceb94c82ebff3985ddddc1db8f26032c718b671880e5677e9081e7f61dda",
        newPassword: "NuovaPassword444!"
      }
      const res = await request.put('/forgotpassword/andrea.salvucci97@gmail.com')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(401)
    expect(res.body.message).toBe("Unauthorized")
    })

    it('PUT /forgotpassword token already used sends back 401 Unauthorized', async()=>{
      const credenziali = {
        token: "38f29fb6160dee452e0b11e42df198d6e3d7b9c17d62b66a8ee9f9b6316d7d4e",
        newPassword: "NuovaPassword444!"
      }
      const res = await request.put('/forgotpassword/andrea.salvucci97@gmail.com')
    .set('Accept', 'application/json')
    .send(credenziali)
    .expect('Content-Type', /json/)
    .expect(400)
    expect(res.body.message).toBe("The reset token has already been used")
    })




  })