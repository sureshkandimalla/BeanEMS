// src/PieChart.js
import React from 'react';
import ReactApexChart from 'react-apexcharts';

const PieCharts = ({ chartData, chartLabels }) => {

  let labels = chartLabels; // Take the first 3 labels
  let series = chartData; 
  let colors = ['#f8aa4e', '#6bcbe2', '#78a0ed']; 

  if (chartData?.length === 4) {
      labels = chartLabels.slice(0, 4); // Take all 4 labels
      series = chartData.slice(0, 4); 
      colors.push('#596b4e'); 
  }

  const chartOptions = {
    options: {
      dataLabels: {
        enabled: false,},
      labels: labels,
      colors: colors,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    },
    series: series,
    chart: {
      type: 'donut'
    }
  };

  return (
    <ReactApexChart options={chartOptions?.options} series={chartOptions?.series} type="donut" width="100%" />
  );
};

export default PieCharts;
