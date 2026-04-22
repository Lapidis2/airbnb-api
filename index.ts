import express from 'express';
import http, { IncomingMessage, ServerResponse } from 'http';
const app=express();
const port=5000;
app.use(express.json());

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js!');
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
