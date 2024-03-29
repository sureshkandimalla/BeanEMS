// src/RevenueChart.js
import React from 'react';
import ReactApexChart from 'react-apexcharts';

const RevenueCharts = ({ thisMonthData, lastMonthData }) => {
  const chartOptions = {
    options: {
      plotOptions: {
        bar: {
         borderRadius: 5,
         columnWidth:30
        }},
      dataLabels: {
        enabled: false,},
        colors:['#63abfd','#e697ff'],
      chart: {
        type: 'bar',
        height: 250
      },
      xaxis: {
        categories: ['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5']
      },
      yaxis:{
        show: false
      },
      legend: {
        position: 'top'
      }
    },
    series: [
      {
        name: 'This Month',
        data: thisMonthData
      },
      {
        name: 'Last Month',
        data: lastMonthData
      }
    ]
  };

  return (
    <ReactApexChart options={chartOptions.options} series={chartOptions.series} type="bar" height={150} />
  );
};

export default RevenueCharts;
