
  let populateData = (data) =>  {
    console.log('is new:', data)
  };
   
fetch('https://area-data-api.test/api/places/9131/reports/yearly?date=2022-05-01&with_children=1', {
    headers: new Headers({
        'Authorization': 'Bearer 3|mr49dJQwvS4lGj5wgUq7bvzV6NdViZHbu9yAUknU', 
        'Accept': 'application/json',
        'Content-type': 'application/json',
    })
})
.then(response=>response.json())
.then(data=> populateData(data));