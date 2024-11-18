// import React, { useState, useEffect } from 'react';
// import { TextField, Table, TableBody, TableCell, Box, TableContainer, TableHead, TableRow, Paper, Button, Modal } from '@mui/material';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
// import { addDays, startOfWeek, format } from 'date-fns';

// const TimesheetModal = ({ open, onClose, onSave, employee }) => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [weekData, setWeekData] = useState(Array(7).fill({ date: new Date(), hours: 0 }));

//   useEffect(() => {
//     const startOfTheWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
//     setWeekData(Array.from({ length: 7 }, (_, i) => ({
//       date: addDays(startOfTheWeek, i),
//       hours: 0
//     })));
//   }, [selectedDate]);

//   const handleHoursChange = (index, value) => {
//     const updatedWeekData = [...weekData];
//     updatedWeekData[index] = { ...updatedWeekData[index], hours: Number(value) };
//     setWeekData(updatedWeekData);
//   };

//   const handleSave = () => {
//     const totalHours = weekData.reduce((sum, entry) => sum + entry.hours, 0);
//     onSave(totalHours); // Pass the total hours to the parent component
//     onClose(); // Close the modal
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box
//         sx={{
//           position: 'relative',
//           top: '10%',  // Adjust top position for initial placement
//           maxWidth: '500px',
//           margin: '0 auto',
//           padding: '20px',
//           backgroundColor: 'white',
//           boxShadow: 24,
//         }}
//       >
//         <h3>Timesheet for {employee?.name}</h3>
//         <LocalizationProvider dateAdapter={AdapterDateFns}>
//           <DatePicker
//             label="Select Week Start Date"
//             value={selectedDate}
//             onChange={setSelectedDate}
//             renderInput={(params) => <TextField {...params} />}
//           />
//         </LocalizationProvider>
//         <TableContainer component={Paper} style={{ marginTop: '20px' }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Date</TableCell>
//                 <TableCell>Day</TableCell>
//                 <TableCell>Hours Worked</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {weekData.map((entry, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{format(entry.date, 'yyyy-MM-dd')}</TableCell>
//                   <TableCell>{format(entry.date, 'EEEE')}</TableCell>
//                   <TableCell>
//                     <TextField
//                       type="number"
//                       value={entry.hours}
//                       onChange={(e) => handleHoursChange(index, e.target.value)}
//                       inputProps={{ min: 0, max: 24 }}
//                     />
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//         <Button onClick={handleSave} variant="contained" color="primary" style={{ marginTop: '20px' }}>
//           Save Timesheet
//         </Button>
//       </Box>
//     </Modal>
//   );
// };

// export default TimesheetModal;
