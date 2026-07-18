export default async function handler(req,res){

try {

const key = process.env.BOULEVARD_API_KEY;

if(!key){
  return res.status(500).json({
    error:"Missing BOULEVARD_API_KEY"
  });
}


const credentials =
Buffer
.from(key + ":")
.toString("base64");


const query = `
query {
 business {
   id
   name
 }
}
`;


const BUSINESS_ID =
"3a83c246-a294-4eee-9a1a-a960ade6528a";


const response = await fetch(
`https://api.joinblvd.com/api/2020-01/${BUSINESS_ID}/client`
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
