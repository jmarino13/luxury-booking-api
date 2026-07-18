export default async function handler(req,res){

try {

const key = process.env.BOULEVARD_API_KEY;

const credentials = Buffer
.from(key + ":")
.toString("base64");


const query = `
mutation {
  createCart(
    locationId: "c4d9bb0-b959-4898-8444-23d32a1f994e"
    cart: {
      clientMessage: "Luxury Medical Group booking test"
    }
  ) {
   cartToken
  }
}
`;


const response = await fetch(
"https://www.joinblvd.com/b/.api/graph",
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Basic ${credentials}`
},
body:JSON.stringify({
query
})
});


const text = await response.text();

return res.status(200).json({
status:response.status,
response:text
});


}catch(error){

return res.status(500).json({
error:error.message,
stack:error.stack
});

}

}
