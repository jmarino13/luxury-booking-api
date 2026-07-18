export default async function handler(req,res){

if(req.method==="OPTIONS"){
return res.status(200).end();
}

const BUSINESS_ID = process.env.BOULEVARD_BUSINESS_ID;
console.log("BUSINESS ID:", BUSINESS_ID);
console.log("API KEY EXISTS:", !!process.env.BOULEVARD_API_KEY);
const credentials =
Buffer
.from(process.env.BOULEVARD_API_KEY + ":")
.toString("base64");


const query = `
mutation {
 createCart(
 locationId:"urn:blvd:Location:67044558-0bab-4c70-adc8-d7d627da6525"
 ){
  cart{
   id
   availableCategories{
    name
    availableItems{
     id
     name
    }
   }
  }
 }
}
`;


const url = `https://api.joinblvd.com/api/2020-01/${BUSINESS_ID}/client`;

console.log("BOULEVARD URL:", url);

const response = await fetch(
url,
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
status: response.status,
body: text
});
}
