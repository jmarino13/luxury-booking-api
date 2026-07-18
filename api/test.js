export default async function handler(req, res) {

try {

const key = process.env.BOULEVARD_API_KEY;
const businessId = process.env.BOULEVARD_BUSINESS_ID;

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
"https://api.joinblvd.com/graphql",
{
method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":`Basic ${credentials}`,
"x-blvd-bid": businessId
},

body:JSON.stringify({
query
})

});


const text = await response.text();


return res.status(200).json({
status: response.status,
response:text
});


}

catch(error){

return res.status(200).json({
error:error.message,
stack:error.stack
});

}

}
