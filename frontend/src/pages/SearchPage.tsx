import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel,  
  Divider, 
  Stack,
  IconButton,
  InputAdornment,
  MenuItem,
  FormGroup
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'; 
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

import { useUI } from '../context/UIProvider';
import { BusCard } from '../components/booking/BusCard';
import {Header} from '../components/common/Header';
import {CustomPagination} from '../components/common/CustomPagination';
import type { BusSearchResult } from '../services/api/models/BusSearchResult';
import { PublicSearchService } from '../services/api/services/PublicSearchService';
import { useSearchParams } from 'react-router-dom';

// --- CONSTANTS ---
const BUS_TYPE_MAPPING: Record<string, string> = {
  'AC Buses': 'AC',
  'Non-AC Buses': 'Non-AC', 
  'Sleeper': 'Sleeper',
  'Non-AC Seater': 'Non-AC Seater',
  'Semi-Sleeper': 'Semi-Sleeper',
  'AC Sleeper': 'AC Sleeper',
  'AC Seater': 'AC Seater',
  'Volvo': 'Volvo Multi-Axle'
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  
  const [source, setSource] = useState(searchParams.get('from') || '');
  const [destination, setDestination] = useState(searchParams.get('to') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'price-asc');
  
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit]= useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [buses, setBuses] = useState<BusSearchResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  
  const {showToast, startLoading, stopLoading} = useUI();

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    const label = event.target.name;
    const isChecked = event.target.checked;
    setSelectedFilters(prev => isChecked ? [label] : prev.filter(item => item !== label));
  };

  const handleSearch = async () => {
    startLoading();
    try {
        // 1. Date Fix
        let formattedDate = date;
        if (date.includes('-')) {
          const parts = date.split('-'); 
          if (parts[0].length === 2 && parts[2].length === 4) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }

        // 2. Capitalization Fix
        const formatCity = (city: string) => {
            if (!city) return '';
            return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        };

        // 3. Filter Mapping
        let apiBusType = undefined;
        if (selectedFilters.length > 0) {
            const uiLabel = selectedFilters[0]; 
            apiBusType = BUS_TYPE_MAPPING[uiLabel];
        }

        const lastHyphenIndex = sortBy.lastIndexOf('-');
        const sortField = sortBy.substring(0, lastHyphenIndex);
        const sortOrder = sortBy.substring(lastHyphenIndex + 1);

        console.log("Sort Debug:", { 
          raw: sortBy, 
          field: sortField, 
          order: sortOrder 
      });

        console.log("Sending Search:", { 
            from: formatCity(source), 
            to: formatCity(destination), 
            date: formattedDate,
            busType: apiBusType,
            sortField,
            sortOrder
        });
        

        const response = await PublicSearchService.searchTrips(
            formatCity(source),
            formatCity(destination),
            formattedDate,
            apiBusType as any,
            undefined,
            undefined,
            undefined,
            page,
            limit,
            undefined,
            sortField as 'price' | 'rating' | 'departure_time',
            sortOrder as 'asc' | 'desc'
        );

        if(response.data){
            setBuses(response.data);
            setTotalPages(response.meta?.totalPages || 1);
            setTotalItems(response.meta?.total ||0)
        } else {
            setBuses([]);
            setTotalPages(1);
            setTotalItems(0);
            showToast('Sorry !','No buses found on this route', "info");
        }
    } catch(error){
        console.error("Error fetching buses: ", error);
        showToast('Sorry !','Failed to search buses.', "error");
    } finally {
        stopLoading();
    }
  };

  

  useEffect(() => {
    if(source && destination && date && buses.length > 0){
        handleSearch();
    }
  }, [selectedFilters, sortBy, page, limit]);



  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      
      <Header />

      {/* SEARCH BAR (Same as before) */}
      <Box sx={{ bgcolor: 'background.paper', py: 3, borderBottom: '1px solid', borderColor: 'divider', boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
        <Container maxWidth="xl">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField 
                label="From" fullWidth 
                value={source} onChange={(e) => setSource(e.target.value)} 
                slotProps={{ input: { startAdornment: (<InputAdornment position="start"><DirectionsBusIcon color="action" /></InputAdornment>) } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 0.5 }} sx={{ display: 'flex', justifyContent: 'center' }}>
               <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider' }}><SwapHorizIcon fontSize="small" /></IconButton>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField 
                label="To" fullWidth 
                value={destination} onChange={(e) => setDestination(e.target.value)} 
                slotProps={{ input: { startAdornment: (<InputAdornment position="start"><DirectionsBusIcon color="action" /></InputAdornment>) } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2.5 }}>
              <TextField type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button variant="contained" color="primary" fullWidth size="large" disableElevation startIcon={<SearchIcon />} onClick={handleSearch} sx={{ height: '56px', fontSize: '1rem' }}>
                Modify Search
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* MAIN CONTENT */}
      <Container maxWidth="xl" sx={{ mt: 4, pb: 8 }}>
        <Grid container spacing={3}>
          
          {/* SIDEBAR FILTERS (Same as before) */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'sticky', top: 100 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <FilterAltIcon color="action" />
                  <Typography variant="h6" fontWeight="bold">Filters</Typography>
                </Stack>
                <Button size="small" onClick={() => setSelectedFilters([])}>Clear All</Button>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Bus Type</Typography>
              <FormGroup>
                {Object.keys(BUS_TYPE_MAPPING).map((label) => (
                    <FormControlLabel 
                        key={label}
                        control={<Checkbox name={label} checked={selectedFilters.includes(label)} onChange={handleFilterChange} size="small" />} 
                        label={<Typography variant="body2">{label}</Typography>} 
                    />
                ))}
              </FormGroup>
            </Paper>
          </Grid>

          {/* RESULTS SECTION */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>          
               <Box>
                 <Typography variant="h5" color="text.primary" fontWeight="bold">{totalItems} Buses found</Typography>
                 <Typography variant="body2" color="text.secondary">Displaying buses for <b>{source}</b> to <b>{destination}</b></Typography>
               </Box>
               
               {/* --- CHANGED: SORT DROPDOWN --- */}
               <Box sx={{ minWidth: 200 }}>
                 <TextField
                   select 
                   label="Sort By" 
                   size="small" 
                   fullWidth 
                   value={sortBy}
                   onChange={(e) => {setSortBy(e.target.value); setPage(1);}} 
                   variant="outlined" 
                   sx={{ bgcolor: 'background.paper' }}
                 >
                   {/* Price Options */}
                   <MenuItem value="price-asc">Price (Low to High)</MenuItem>
                   <MenuItem value="price-desc">Price (High to Low)</MenuItem>
                   
                   {/* Time Options */}
                   <MenuItem value="departure_time-asc">Departure (Earliest)</MenuItem>
                   <MenuItem value="departure_time-desc">Departure (Latest)</MenuItem>
                   
                   {/* Rating Options */}
                   <MenuItem value="rating-desc">Rating (Highest First)</MenuItem>
                   <MenuItem value="rating-asc">Rating (Lowest First)</MenuItem>
                 </TextField>
               </Box>
            </Box>

            {buses.map((bus) => (
              <BusCard key={bus.trip_id} bus={bus}  />
            ))}
            
           {totalItems > 0 && (
              <CustomPagination
                totalItems={totalItems}
                page={page}
                limit={limit}
                onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top:0, behavior:'smooth'});
                }}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
              />
           )}
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default SearchPage;