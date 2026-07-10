export default async function handler(req,res){

const BUSINESS_ID =
"4a7bb2cd-2bfc-4bf9-aa0b-0fa508cc287b";


const query = `
query {

__type(name:"RootQueryType"){

fields{

name

args{

name

type{

name

kind

}

}

}

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
body:JSON.stringify({query})
});


const data = await response.json();

res.status(200).json(data);

}
