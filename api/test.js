const query = `
query {
 business(id:"3a83c246-a294-4eee-9a1a-a960ade6528a") {
   id
   name
   services {
     id
     name
   }
 }
}
`;
