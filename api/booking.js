export default async function handler(req,res){

if(req.method==="OPTIONS"){
return res.status(200).end();
}

const BUSINESS_ID = process.env.BOULEVARD_BUSINESS_ID;

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


const response = await fetch(
`https://api.joinblvd.com/api/2020-01/${BUSINESS_ID}/client`,
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

}
