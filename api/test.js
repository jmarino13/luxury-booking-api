export default async function handler(req,res){

try {

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
headers:{
"Content-Type":"application/json",
"Authorization": `Basic ${credentials}`,
"x-blvd-bid": process.env.BOULEVARD_BUSINESS_ID
},
body:JSON.stringify({
query: query
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
