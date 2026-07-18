const response = await fetch(
"https://www.joinblvd.com"
);

const text = await response.text();

return res.status(200).json({
status: response.status,
response:text.substring(0,200)
});
