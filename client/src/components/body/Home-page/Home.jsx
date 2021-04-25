import { Card, CardContent, Container, Grid, Grow } from '@material-ui/core'
import React from 'react'

const Home = () => {
    return (
        <>
          <Container>
          <Grow in>
          
             
              <Grid container spacing={3}>
              <Grid item md={12} >
                  <Card variant="outlined" style={{marginTop: "20px"}}>
                      <CardContent>
                          <h1 style={{textAlign: "center",}}>Want to access another page..Just go to Sign-In page</h1>
                      </CardContent>
                  </Card>
              </Grid>
          </Grid>
              
          </Grow>
          </Container>  
        </>
    )
}

export default Home
