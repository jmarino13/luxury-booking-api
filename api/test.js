export default async function handler(req,res){

try {

const key = process.env.BOULEVARD_API_KEY;

const credentials = Buffer
.from(key + ":")
.toString("base64");


const query = `
mutation {
  createCart {
    cartToken
  }
}
`;


const response = await fetch(
"https://www.joinblvd.com/.api/graph",
{
method:"POST",
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.BOULEVARD_API_KEY}`,
  "x-blvd-bid": process.env.BOULEVARD_BUSINESS_ID
}
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
