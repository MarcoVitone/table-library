import type { FC } from "react";
import { useState, useMemo } from "react";
import {
  IconButton,
  Popover,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Button,
} from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import type {
  IFilterConfig,
  IFilter,
  TFiltering,
  IFilterOption,
} from "../../../defines/common.types.ts";
import { useTable } from "../../../hooks/use-table/use-table.ts";

interface IFilterMenuProps {
  dataKey: string;
  config: IFilterConfig;
}

const FilterMenu: FC<IFilterMenuProps> = ({ dataKey, config }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { filtering, setFiltering } = useTable();

  const currentFilter = useMemo(() => {
    return filtering?.find((f: IFilter) => f.key === dataKey);
  }, [filtering, dataKey]);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (
    val: string | number | boolean | (string | number | boolean)[] | null
  ) => {
    if (!setFiltering) return;

    setFiltering((prev: TFiltering) => {
      const otherFilters = prev.filter((f: IFilter) => f.key !== dataKey);

      if (
        val === "" ||
        val === null ||
        (Array.isArray(val) && val.length === 0)
      ) {
        return otherFilters;
      }

      let op: IFilter["op"] = "eq";
      if (config.type === "text") op = "match";
      if (config.type === "multi-select") op = "in";

      return [...otherFilters, { key: dataKey, op, val }];
    });
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        color={currentFilter ? "primary" : "default"}
        className={`filter-icon ${currentFilter ? "active" : ""} ${
          open ? "open" : ""
        }`}
      >
        <FilterAlt fontSize="inherit" />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: { style: { padding: "1rem", minWidth: "200px" } },
        }}
      >
        <Box display="flex" flexDirection="column" gap="1rem">
          {config.type === "text" && (
            <TextField
              label={config.filterLabel || "Cerca..."}
              variant="standard"
              size="small"
              fullWidth
              value={currentFilter?.val || ""}
              onChange={(e) => handleFilterChange(e.target.value)}
              autoFocus
            />
          )}

          {(config.type === "select" || config.type === "multi-select") && (
            <FormControl fullWidth size="small" variant="standard">
              <InputLabel>{config.filterLabel || "Filtra"}</InputLabel>
              <Select
                multiple={config.type === "multi-select"}
                value={
                  (currentFilter?.val as
                    | string
                    | number
                    | boolean
                    | (string | number | boolean)[]) ||
                  (config.type === "multi-select" ? [] : "")
                }
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                {config.options?.map((opt: IFilterOption) => (
                  <MenuItem
                    key={String(opt.value)}
                    value={opt.value as string | number}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {config.type === "date" && (
            <TextField
              type="date"
              label={config.filterLabel || "Data"}
              variant="standard"
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={currentFilter?.val || ""}
              onChange={(e) => handleFilterChange(e.target.value)}
            />
          )}

          {config.type === "number" && (
            <TextField
              type="number"
              label={config.filterLabel || "Valore"}
              variant="standard"
              size="small"
              fullWidth
              value={currentFilter?.val || ""}
              onChange={(e) => handleFilterChange(e.target.value)}
            />
          )}

          <Button
            size="small"
            onClick={() => {
              handleFilterChange(null);
              handleClose();
            }}
            disabled={!currentFilter}
          >
            Reset
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export { FilterMenu };
