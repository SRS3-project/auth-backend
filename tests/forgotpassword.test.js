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