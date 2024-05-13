import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Button, Container, Typography } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';
import { db } from '../config/firebase-config';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [titleTotalsAchat, setTitleTotalsAchat] = useState([]);
  const [titleTotalsPNL, setTitleTotalsPNL] = useState([]);
  const listTransactionRef = collection(db, 'bank_transactions');
  const [groupByTitre, setGroupByTitre] = useState([]);

  const getTransactionsList = async () => {
    const transactionSnapshot = await getDocs(listTransactionRef);

    const transactionListData = transactionSnapshot.docs.map((doc) => {
      const transactionData = doc.data();

      // Assuming your date field in Firebase is called 'date'
      const transactionDate = new Date(transactionData.selectedDate.toDate()); // Convert Firestore Timestamp to JavaScript Date object

      const transactionDay = transactionDate.getDate();
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();
      const formattedDate = `${transactionDay.toString().padStart(2, '0')}/${transactionMonth
        .toString()
        .padStart(2, '0')}/${transactionYear}`;

      return {
        ...transactionData,
        id: doc.id,
        formattedDate, // Add formatted date to the object
      };
    });
    setTransactions(transactionListData);
    const titleTotalsPNL = transactionListData.reduce((acc, row) => {
      if (!acc[row.titre]) {
        acc[row.titre] = 0;
      }

      if (row.av === 'vente') {
        acc[row.titre] += Number(row.montant);
      } else if (row.av === 'achat') {
        acc[row.titre] -= Number(row.montant);
      }

      return acc;
    }, {});
    const formattedTitleTotalsPNL = Object.keys(titleTotalsPNL).map((title) => ({
      label: title,
      value: titleTotalsPNL[title],
    }));
    setTitleTotalsPNL(formattedTitleTotalsPNL);

    const titleTotalsAchat = transactionListData.reduce((acc, row) => {
      if (!acc[row.titre]) {
        acc[row.titre] = 0;
      }
      if (row.av === 'achat') {
        acc[row.titre] += Number(row.montant);
      }

      return acc;
    }, {});

    const formattedTitleTotalsAchat = Object.keys(titleTotalsAchat).map((title) => ({
      label: title,
      value: titleTotalsAchat[title],
    }));
    setTitleTotalsAchat(formattedTitleTotalsAchat);
    setGroupByTitre(formattedTitleTotalsAchat);
  };
  useEffect(() => {
    getTransactionsList();
  }, []);

  const handleCompChange = (type) => {
    if (type === 'Nbr. Action') {
      setGroupByTitre(titleTotalsAchat);
    } else if (type === '+Value') {
      setGroupByTitre(titleTotalsPNL);
    }
  };
  const handleValuesChange = (type) => {
    if (type === 'Nbr. Action') {
      setGroupByTitre(titleTotalsAchat);
    } else if (type === '+Value') {
      setGroupByTitre(titleTotalsPNL);
    }
  };

  return (
    <>
      <Helmet>
        <title> Tableau de bord </title>
      </Helmet>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Conversion Rates"
              handleCompChange={handleValuesChange}
              subheader="(+43%) than last year"
              chartData={groupByTitre}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Composition"
              chartData={groupByTitre}
              handleCompChange={handleCompChange}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.warning.main,
                theme.palette.error.main,
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="Historique"
              subheader="(+43%) than last year"
              chartLabels={['02/01/2021', '03/01/2021', '04/01/2021', '05/01/2021', '06/01/2021', '07/01/2021']}
              chartData={[
                {
                  name: 'Team A',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27],
                },
                {
                  name: 'Team B',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52],
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
              chartData={[
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="News Update"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: faker.name.jobTitle(),
                description: faker.name.jobTitle(),
                image: `/assets/images/covers/cover_${index + 1}.jpg`,
                postedAt: faker.date.recent(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title="Order Timeline"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: [
                  '1983, orders, $4220',
                  '12 Invoices have been paid',
                  'Order #37745 from September',
                  'New order placed #XF-2356',
                  'New order placed #XF-2346',
                ][index],
                type: `order${index + 1}`,
                time: faker.date.past(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite
              title="Traffic by Site"
              list={[
                {
                  name: 'FaceBook',
                  value: 323234,
                  icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} />,
                },
                {
                  name: 'Google',
                  value: 341212,
                  icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} />,
                },
                {
                  name: 'Linkedin',
                  value: 411213,
                  icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} />,
                },
                {
                  name: 'Twitter',
                  value: 443232,
                  icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} />,
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppTasks
              title="Tasks"
              list={[
                { id: '1', label: 'Create FireStone Logo' },
                { id: '2', label: 'Add SCSS and JS files if required' },
                { id: '3', label: 'Stakeholder Meeting' },
                { id: '4', label: 'Scoping & Estimations' },
                { id: '5', label: 'Sprint Showcase' },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
