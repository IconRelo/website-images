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
          containLabel:true
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

    document.getElementById('uk-stock-summary').innerText = 'Rental Property Stock has changed by '+data.overview.stock_change_perc;

    let chart_data = data.data.map((item) => {
        return {
            'name' : 'Stock',
            'date' : Date.parse(item.items[0].date),
            'date_name' : item.items[0].date,
            'stock_change': item.stock_change_from_prev_perc,
            'value' : [
                Date.parse(item.items[0].date),
                item.stock
              ]
        
        }
    });
    let labels = data.data.map((item) => item.items[0].date);

    chart['uk_stock'].setOption({
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                return (params[0].data.stock_change) ? 'Stock Change: '+ params[0].data.stock_change : 'Stock Change: 0%';
            }
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
                showSymbol: false,
                data: chart_data,
                lineStyle: {
                  color: '#2871b8',
                  width: 4
                },
            }
        ]
     })

  }


  let populateUKRent = (data) => {

    if(data.overview.rent_change > 0){
        document.getElementById('uk-rent-summary').innerText = 'Rental Property Rents have gone up on average ??'+Math.round(data.overview.rent_change)+ ' per month';
    } else {
        document.getElementById('uk-rent-summary').innerText = 'Rental Property Rents have gone down on average ??'+Math.round(data.overview.rent_change)+ ' per month';
    }

    let chart_data = data.data.map((item) => {
        return {
            'name' : 'Rent',
            'date' : Date.parse(item.items[0].date),
            'date_name' : item.items[0].date,
            'rent_change': item.rent_change_from_prev_perc,
            'value' : [
                Date.parse(item.items[0].date),
                item.average
              ]
        
        }
    });
    let labels = data.data.map((item) => item.items[0].date);

    console.log(chart_data);

    chart['uk_rent'].setOption({
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                return (params[0].data.rent_change) ? 'Rental Price Change: '+ params[0].data.rent_change : 'Rental Price Change: 0%';
            }
        },
        grid:{
          left: 0,
          containLabel:true
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
                lineStyle: {
                    color: '#2871b8',
                    width: 4
                  },
            }
        ]
     })

  }

  let populateRegionalStock = (data) => {

    let labels = data.map((item) => item.area);
    const datasetWithFilters = [];
    const seriesList = [];
    let increaseDecrease = [];
    let raw_data = [];
    data.forEach((element) => {

        increaseDecrease.push(element.overview.stock_change)

        let mapped_data = element.data.map((item) => {

            return {
                'name':element.area,
                'region':element.area,
                'value': item.stock,
                'stock': item.stock,
                'stock_change': item.stock_change_from_prev_perc,
                'date': Date.parse(item.items[0].date)
            }
        })
        mapped_data.forEach((mapped_element) => {
            raw_data.push(mapped_element)
        })
    })

    increaseDecrease = {
        increased : increaseDecrease.filter(item => item > 0),
        decreased : increaseDecrease.filter(item => item < 0),
    }


document.getElementById('regional-stock-summary').innerText = 'Rental Property Stock decreased in '+increaseDecrease.decreased.length +' out of '+labels.length+' regions';


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

      lineStyle: {
        width: 4
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
    tooltip: {
        trigger: 'axis',
        formatter: function (params) {
            return (params[0].data.stock_change) ? 'Stock change: '+ params[0].data.stock_change : 'Stock change: 0%';
        }
    },
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
        right: 140,
        containLabel:true
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
    let increaseDecrease = [];
    let raw_data = [];
    data.forEach((element) => {

        increaseDecrease.push(element.overview.rent_change)

        let mapped_data = element.data.map((item) => {
            return {
                'name':element.area,
                'region':element.area,
                'value': Math.round(item.average),
                'rent': Math.round(item.average),
                'date': Date.parse(item.items[0].date),
                'rent_change': item.rent_change_from_prev_perc,
            }
        })
        mapped_data.forEach((mapped_element) => {
            raw_data.push(mapped_element)
        })
    })

    increaseDecrease = {
        increased : increaseDecrease.filter(item => item > 0),
        decreased : increaseDecrease.filter(item => item < 0),
    }


document.getElementById('regional-rent-summary').innerText = 'Rental Property Prices have increased in '+increaseDecrease.increased.length +' out of '+labels.length+' regions';

    

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
      lineStyle: {
        width: 4
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
    tooltip: {
        trigger: 'axis',
        formatter: function (params) {
            return (params[0].data.rent_change) ? 'Rental Price Change: '+ params[0].data.rent_change : 'Rental Price Change: 0%';
        }
    },
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
        right: 140,
        containLabel:true
    },
    series: seriesList,
    dimensions: ['date', 'rent']
  };
  chart['regional_pricing'].setOption(option);

  }
   
fetch('https://staging.myareawise.com/api/places/8964/reports/half-yearly?date=2022-06-01&with_children=1', {
    headers: new Headers({
        'Authorization': 'Bearer 3|mr49dJQwvS4lGj5wgUq7bvzV6NdViZHbu9yAUknU', 
        'Accept': 'application/json',
        'Content-type': 'application/json',
    })
})
.then(response=>response.json())
.then(data=> populateData(data));