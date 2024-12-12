import React from 'react';
import ReactApexChart from 'react-apexcharts';

const PieCharts = ({ chartData, chartLabels }) => {
  let labels = chartLabels; 
  let series = chartData;
  let colors = ['#f8aa4e', '#6bcbe2', '#78a0ed'];

  if (chartData?.length === 4) {
      labels = chartLabels.slice(0, 4);
      series = chartData.slice(0, 4);
      colors.push('#596b4e');
  }

  const chartOptions = {
    chart: {
      type: 'donut',
      width: '100%',
      height: 'auto',
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%',
              height: 'auto',
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    },
    labels: labels,
    colors: colors,
    dataLabels: {
      enabled: false
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
      <ReactApexChart 
        options={chartOptions} 
        series={series} 
        type="donut" 
        width="100%" 
      />
    </div>
  );
};

export default PieCharts;
