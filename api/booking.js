export default async function handler(req,res){

res.setHeader("Access-Control-Allow-Origin","*");
res.setHeader("Access-Control-Allow-Methods","GET, OPTIONS");

if(req.method==="OPTIONS"){
return res.status(200).end();
}


const BUSINESS_ID =
"4a7bb2cd-2bfc-4bf9-aa0b-0fa508cc287b";


const credentials =
Buffer
.from(process.env.BOULEVARD_API_KEY+":")
.toString("base64");


// CREATE CART

const createCartQuery = `

mutation {

createCart(
input:{
locationId:"urn:blvd:Location:67044558-0bab-4c70-adc8-d7d627da6525"
}
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



const cartResponse = await fetch(

https://api.joinblvd.com/api/2020-01/${BUSINESS_ID}/client

{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":
`Basic ${credentials}`
},

body:JSON.stringify({
query:createCartQuery
})

}

);


const cartData = await cartResponse.json();


const cartId =
cartData.data.createCart.cart.id;
const serviceId =
cartData.data.createCart.cart.availableCategories[0]
.availableItems[0]
.id;

// GET AVAILABLE TIMES


const today = new Date().toISOString().split("T")[0];


const timesQuery = `
query {

cartBookableTimes(
  id:"${cartId}"
  locationId:"urn:blvd:Location:67044558-0bab-4c70-adc8-d7d627da6525"
  searchDate:"${today}"
  tz:"America/Chicago"
){

id
startTime

}

}
`;
const timesResponse = await fetch(

`https://sandbox.joinblvd.com/api/2020-01/${BUSINESS_ID}/client`,

{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":
`Basic ${credentials}`
},

body:JSON.stringify({
query:timesQuery
})

}

);



const timesData =
await timesResponse.json();



res.status(200).json({

cartId,

serviceId,

categories:
cartData.data.createCart.cart.availableCategories,

times:
timesData

});

}
