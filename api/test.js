export default async function handler(req,res){

try {

const apiKey = process.env.BOULEVARD_API_KEY;

if (!apiKey) {
  return res.status(500).json({
    error:"Missing BOULEVARD_API_KEY"
  });
}


const credentials =
Buffer
.from(apiKey + ":")
.toString("base64");


const query = `
query {
  business {
    id
    name
  }
}
`;


const response = await fetch(
"https://api.joinblvd.com/api/2020-01/graphql",
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


const data = await response.json();


return res.status(200).json(data);


} catch(error){

return res.status(500).json({
error:error.message
});

}

}
