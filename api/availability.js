export default async function handler(req,res){

res.setHeader("Access-Control-Allow-Origin","*");
res.setHeader("Access-Control-Allow-Methods","GET, OPTIONS");

if(req.method==="OPTIONS"){
 return res.status(200).end();
}


const BUSINESS_ID =
"4a7bb2cd-2bfc-4bf9-aa0b-0fa508cc287b";


const serviceId =
"urn:blvd:Service:69d07ead-e607-4d63-ab54-644ae076b075";


const query = `

query {

availability(

input:{
locationId:"urn:blvd:Location:67044558-0bab-4c70-adc8-d7d627da6525"

serviceId:"${serviceId}"

}

){

times

}

}

`;


const credentials =
Buffer
.from(process.env.BOULEVARD_API_KEY+":")
.toString("base64");


const response = await fetch(

`https://sandbox.joinblvd.com/api/2020-01/${BUSINESS_ID}/client`,

{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":
`Basic ${credentials}`
},

body:JSON.stringify({
query
})

});


const data = await response.json();


res.status(200).json(data);


}
