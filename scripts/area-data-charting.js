

 // Initialize the echarts instance based on the prepared dom
    let chart = []
        chart['uk_stock'] = echarts.init(document.getElementById('uk-stock'));
        chart['uk_rent'] = echarts.init(document.getElementById('uk-rent'));
        chart['regional_stock'] = echarts.init(document.getElementById('regional-stock'));
        chart['regional_pricing'] = echarts.init(document.getElementById('regional-pricing'));
        chart['bedroom_breakdown'] = echarts.init(document.getElementById('bedroom-breakdown'));


  let populateData = (data) =>  {
    console.log('is new:', data)
    populateUKStock(data);
    populateUKRent(data);
    populateRegionalStock(data.children);
    populateRegionalPricing(data.children);
    populateBedroomBreakdown(data.data)

  };

  let populateBedroomBreakdown = (data) => {

    let raw_data = [];
    let series = [];
    let labels = [];

    data.forEach((item) => {
        item.items.forEach((bedroom) => {
            if(!labels.includes((bedroom.bedrooms) ? bedroom.bedrooms + ' bedroom' : 'Studio')){
                labels.push((bedroom.bedrooms) ? bedroom.bedrooms + ' bedroom' : 'Studio')
            }
            if(typeof raw_data[bedroom.bedrooms] == 'undefined'){
                raw_data[bedroom.bedrooms] = []
            }
            raw_data[bedroom.bedrooms].push(
                {
                    name: (bedroom.bedrooms) ? bedroom.bedrooms + ' bedroom' : 'Studio',
                    value: bedroom.count,
                    date: Date.parse(bedroom.date)
                }
            )
        })
    });


    console.log('raw', raw_data)

    raw_data.forEach((bed) => {
        series.push({
            name: bed[0].name,
            type: 'line',
            stack: 'Total',
            smooth: true,
            showSymbol: false,
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: bed.map((item) => [
                item.date,
                item.value
              ])
          })
    })

    option = {
        legend: {
          data: labels
        },
        grid: {
          left: 0,
          right: '4%',
          bottom: '3%',
        },
        xAxis: [
          {
            type: 'time',
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            show:false,
            type: 'value'
          }
        ],
        series: series
      };

    chart['bedroom_breakdown'].setOption(option);
  };

  let populateUKStock = (data) => {

    let chart_data = data.data.map((item) => {
        return {
            'name' : 'Stock',
            'date' : Date.parse(item.items[0].date),
            'date_name' : item.items[0].date,
            'value' : [
                Date.parse(item.items[0].date),
                item.stock
              ]
        
        }
    });
    let labels = data.data.map((item) => item.items[0].date);

    chart['uk_stock'].setOption({
        xAxis: {
            type: 'time'
          },
        yAxis: {
            show: false,
        },
        series: [
            {
                type: "line",
                name: "Stock",
                smooth: true,
                showSymbol: false,
                data: chart_data.reverse(),
            }
        ]
     })

  }


  let populateUKRent = (data) => {

    let chart_data = data.data.map((item) => {
        return {
            'name' : 'Rent',
            'date' : Date.parse(item.items[0].date),
            'date_name' : item.items[0].date,
            'value' : [
                Date.parse(item.items[0].date),
                item.average_rent_50
              ]
        
        }
    });
    let labels = data.data.map((item) => item.items[0].date);

    console.log(chart_data);

    chart['uk_rent'].setOption({
        grid:{
          left: 0
        },
        xAxis: {
            type: 'time'
          },
          yAxis: {
            show: false,
          },
        series: [
            {
                type: "line",
                name: "Stock",
                smooth: true,
                data: chart_data,
                showSymbol: false,
            }
        ]
     })

  }

  let populateRegionalStock = (data) => {

    let labels = data.map((item) => item.area);
    const datasetWithFilters = [];
    const seriesList = [];
    let raw_data = [];
    data.forEach((element) => {
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
      endLabel: {
        show: true,
        formatter: function (params) {
          return params.data.name;
        }
      },
      labelLayout: {
        moveOverlap: 'shiftY'
      },
      emphasis: {
        focus: 'series'
      },
      encode: {
        x: 'date',
        y: 'stock',
        label: ['region', 'stock'],
        itemName: 'Date',
        //tooltip: ['stock']
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
    /*tooltip: {
      order: 'valueDesc',
      trigger: 'axis'
    },*/
    xAxis: {
      type: 'time',
      nameLocation: 'middle'
    },
    yAxis: {
        show: false,
    },
    grid: {
        left: 0,
        right: 140
    },
    series: seriesList,
    dimensions: ['date', 'stock']
  };
  chart['regional_stock'].setOption(option);

  }

  let populateUKPricing = (data) => {

    let chart_data = data.data.map((item) => item.stock);
    let labels = data.data.map((item) => item.items[0].date);

    chart['uk_pricing'].setOption({
        xAxis: {
            type: 'time'
          },
          yAxis: {
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

  let populateRegionalPricing = (data) => {

    let labels = data.map((item) => item.area);
    const datasetWithFilters = [];
    const seriesList = [];
    let raw_data = [];
    data.forEach((element) => {
        let mapped_data = element.data.map((item) => {
            return {
                'name':element.area,
                'region':element.area,
                'value': Math.round(item.average_rent_50),
                'rent': Math.round(item.average_rent_50),
                'date': Date.parse(item.items[0].date)
            }
        })
        mapped_data.forEach((mapped_element) => {
            raw_data.push(mapped_element)
        })
    })
    

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
      endLabel: {
        show: true,
        formatter: function (params) {
          return params.data.name;
        }
      },
      labelLayout: {
        moveOverlap: 'shiftY'
      },
      emphasis: {
        focus: 'series'
      },
      encode: {
        x: 'date',
        y: 'rent',
        label: ['region', 'rent'],
        itemName: 'Date',
        //tooltip: ['rent']
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
    /*tooltip: {
      order: 'valueDesc',
      trigger: 'axis'
    },*/
    xAxis: {
      type: 'time',
      nameLocation: 'middle'
    },
    yAxis: {
        show: false,
    },
    grid: {
        left: 0,
        right: 140
    },
    series: seriesList,
    dimensions: ['date', 'rent']
  };
  chart['regional_pricing'].setOption(option);

  }
   
fetch('https://area-data-api.test/api/places/8964/reports/yearly?date=2022-06-01&with_children=1', {
    headers: new Headers({
        'Authorization': 'Bearer 3|mr49dJQwvS4lGj5wgUq7bvzV6NdViZHbu9yAUknU', 
        'Accept': 'application/json',
        'Content-type': 'application/json',
    })
})
.then(response=>response.json())
.then(data=> populateData(data));