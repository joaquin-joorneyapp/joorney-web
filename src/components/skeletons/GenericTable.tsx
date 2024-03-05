import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

const TableSkeleton = ({ rows, cols }: {rows: number, cols: number}) => {
  // Generate skeleton rows
  const skeletonRows = Array.from({ length: rows }).map((_, rowIndex) => (
    <TableRow key={rowIndex}>
      {Array.from({ length: cols }).map((_, colIndex) => (
        <TableCell key={colIndex}>
          <Skeleton />
        </TableCell>
      ))}
    </TableRow>
  ));

  return (
    <Table>
      <TableHead>
        <TableRow>
          {Array.from({ length: cols }).map((_, index) => (
            <TableCell key={index}>
              <Skeleton height={40}/>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>{skeletonRows}</TableBody>
    </Table>
  );
};

export default TableSkeleton;
