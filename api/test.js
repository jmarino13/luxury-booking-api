export default async function handler(req,res){

const credentials =
Buffer
.from(
process.env.BOULEVARD_API_KEY + ":"
)
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
"https://dashboard.boulevard.io/api/2020-01/graphql",
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
