import express from 'express';
import http, { IncomingMessage, ServerResponse } from 'http';
import  userRoutes from './src/routes/users.routes';
import listingRoutes from './src/routes/listings.routes';
const app=express();
const port=5000;
app.use(express.json());
app.use('/users', userRoutes);
app.use('/listings', listingRoutes);

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js!');
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
