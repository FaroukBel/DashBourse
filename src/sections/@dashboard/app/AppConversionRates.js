import { useState } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Box, Card, CardHeader, Stack, Button, colors } from '@mui/material';
// utils
import { fNumber } from '../../../utils/formatNumber';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

AppConversionRates.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
  handleCompChange: PropTypes.func,
};

export default function AppConversionRates({ title, subheader, chartData, handleCompChange, ...other }) {
  const chartLabels = chartData.map((i) => i.label);

  const chartSeries = chartData.map((i) => i.value);
  const [comp, setComp] = useState('Nbr. Action');

  const chartOptions = useChart({
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (seriesName) => fNumber(seriesName),
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: { horizontal: true, barHeight: '28%', borderRadius: 2,
        dataLabels: { position: 'center' },

          
      },
    },
    xaxis: {
      categories: chartLabels,
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Stack direction={'row'} spacing={1} marginX={2} marginTop={2}>
        <Button
          onClick={() => {
            handleCompChange('Nbr. Action');
            setComp('Nbr. Action');
          }}
          variant={comp === 'Nbr. Action' ? 'contained' : 'outlined'}
        >
          Nbr. Action
        </Button>
        <Button
          onClick={() => {
            handleCompChange('+Value');
            setComp('+Value');
          }}
          variant={comp === '+Value' ? 'contained' : 'outlined'}
        >
          +Value
        </Button>
      </Stack>
      <Box sx={{ mx: 3 }} dir="ltr">
        <ReactApexChart type="bar" series={[{ data: chartSeries }]} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
