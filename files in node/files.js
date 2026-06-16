const { error } = require('console');
const fs = require('fs');

// working with fs object in node js

//read a file
// fs.readFile('./jobs/saturday.txt', (error , data ) =>{
//     if(error){
//         console.log(error)
//     }
//     console.log(data);
// });
//write into a file
// fs.writeFile('./jobs/saturday.txt','Hello , world',(err)=>{
//     if(err)
//     {
//         console.log(err)
//     }
//     console.log('file successfully updated');
// })

//delte a file
fs.mkdir('./assets' , (error) => {
    if(error)
    {
        console.log(error)
    }
    console.log('directory created successfully')
})