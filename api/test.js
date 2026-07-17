export default async function handler(req,res){

try {

const credentials =
Buffer
.from(process.env.BOULEVARD_API_KEY + ":")
.toString("base64");


const response = await fetch(
"https://api.joinblvd.com/api/2020-01/businesses",
{
method:"GET",
headers:{
"Authorization":`Basic ${credentials}`
}
});


const data = await response.json();

return res.status(200).json(data);


} catch(error){

return res.status(500).json({
error:error.message
});

}

}
