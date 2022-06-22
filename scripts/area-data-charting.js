

 // Initialize the echarts instance based on the prepared dom
    let chart = []
        chart['uk_stock'] = echarts.init(document.getElementById('uk-stock'));
        chart['regional_stock'] = echarts.init(document.getElementById('regional-stock'));


  let populateData = (data) =>  {
    console.log('is new:', data)
    populateUKStock(data);
    populateRegionalStock(data.children);

  };

  let populateUKStock = (data) => {

    let chart_data = data.data.map((item) => item.stock);
    let labels = data.data.map((item) => item.items[0].date);

    chart['uk_stock'].setOption({
        xAxis: {
            type: 'category',
            data: labels
          },
          yAxis: {
            type: 'value'
          },
        series: [
            {
                type: "line",
                name: "test",
                data: chart_data
            }
        ]
     })

  }

  let populateRegionalStock = (data) => {

    let labels = data.map((item) => item.area);
    console.log(labels)
    const datasetWithFilters = [];
    const seriesList = [];
    let raw_data = [];
    data.forEach((element) => {
        console.log(element)
        let mapped_data = element.data.map((item) => {
            return {
                'name':element.area,
                'region':element.area,
                'value': item.stock,
                'stock': item.stock,
                'date': Date.parse(item.items[0].date)
            }
        })
        mapped_data.forEach((mapped_element) => {
            raw_data.push(mapped_element)
        })
    })

    console.log(raw_data);
    

  echarts.util.each(labels, function (region) {
    var datasetId = 'dataset_' + region;
    datasetWithFilters.push({
      id: datasetId,
      fromDatasetId: 'dataset_raw',
      transform: {
        type: 'filter',
        config: {
          and: [
            { dimension: 'date', gte: 1950 },
            { dimension: 'region', '=': region }
          ]
        }
      }
    });
    seriesList.push({
      type: 'line',
      datasetId: datasetId,
      showSymbol: false,
      name: region,
      /*endLabel: {
        show: true,
        formatter: function (params) {
            console.log('params', params)
          return params.value.name + ': ' + params.value.value;
        }
      },
      labelLayout: {
        moveOverlap: 'shiftY'
      },*/
      emphasis: {
        focus: 'series'
      },
      encode: {
        x: 'date',
        y: 'stock',
        //label: ['region', 'stock'],
        itemName: 'Date',
        tooltip: ['stock']
      }
    });
  });
  option = {
    animationDuration: 5000,
    dataset: [
      {
        id: 'dataset_raw',
        source: raw_data
      },
      ...datasetWithFilters
    ],
    title: {
      text: 'Stock levels by region'
    },
    tooltip: {
      order: 'valueDesc',
      trigger: 'axis'
    },
    xAxis: {
      type: 'time',
      nameLocation: 'middle'
    },
    yAxis: {
      name: 'Income'
    },
    grid: {
      right: 140
    },
    series: seriesList,
    dimensions: ['date', 'stock']
  };
  chart['regional_stock'].setOption(option);

  }
   
fetch('https://area-data-api.test/api/places/8964/reports/yearly?date=2022-05-01&with_children=1', {
    headers: new Headers({
        'Authorization': 'Bearer 3|mr49dJQwvS4lGj5wgUq7bvzV6NdViZHbu9yAUknU', 
        'Accept': 'application/json',
        'Content-type': 'application/json',
    })
})
.then(response=>response.json())
.then(data=> populateData(data));