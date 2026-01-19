import React from "react";
import {
    Box,
    Pagination,
    Typography,
    Select,
    MenuItem,
    Stack,
    type SelectChangeEvent
} from "@mui/material";

interface CustomPaginationProps {
    totalItems: number;
    page: number;
    limit: number;
    onPageChange: (page:number) => void;
    onLimitChange: (limit:number) => void;
}

export const CustomPagination: React.FC <CustomPaginationProps> = ({
    totalItems,
    page,
    limit,
    onPageChange,
    onLimitChange
}) => {
    const count = Math.ceil(totalItems / limit);

    const handleLimitChange = (event : SelectChangeEvent<number>) => {
        onLimitChange(Number(event.target.value));
    };

    const handlePageChange = (evet: React.ChangeEvent<unknown>, value: number) =>{
        onPageChange(value);
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                mt: 4,
                bgcolor: 'background.paper',
                border:'1px solid',
                borderColor: 'divider',
                borderRadius: 2,
            }}
        >
            <Stack direction="row" alignItems ="center" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                    Rows per page:
                </Typography>
                <Select
                    value={limit}
                    onChange = {handleLimitChange}
                    size = "small"
                    sx={{height:32, minWidth:60}}
                >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary">
                    showing {(page-1)* limit +1} - {Math.min(page * limit, totalItems)} of {totalItems}      
                </Typography>
            </Stack>
            <Pagination 
              count={count}
              page={page}
              onChange={handlePageChange}
              shape="rounded"
              color="primary"
              showFirstButton
              showLastButton
            />
        </Box>
    );
};