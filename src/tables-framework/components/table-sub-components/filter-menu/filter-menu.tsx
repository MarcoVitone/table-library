import type { FC } from "react";
import { useState, useMemo, useId } from "react";
import { IconButton, Button } from "@/tables-framework/ui/controls";
import { NativeDialog } from "@/tables-framework/ui/dialog";
import { FilterAlt } from "@/tables-framework/ui/icons";
import type { IFilterConfig, IFilter, TFiltering } from "@/tables-framework/defines/common.types";
import { useTable } from "@/tables-framework/hooks/use-table/use-table";
interface IFilterMenuProps {
  dataKey: string;
  config: IFilterConfig;
}
const FilterMenu: FC<IFilterMenuProps> = ({
  dataKey,
  config
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const {
    filtering,
    setFiltering
  } = useTable();
  const currentFilter = useMemo(() => {
    return filtering?.find((f: IFilter) => f.key === dataKey);
  }, [filtering, dataKey]);
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleFilterChange = (val: string | number | boolean | (string | number | boolean)[] | null) => {
    if (!setFiltering) return;
    setFiltering((prev: TFiltering) => {
      const otherFilters = prev.filter((f: IFilter) => f.key !== dataKey);
      if (val === "" || val === null || Array.isArray(val) && val.length === 0) {
        return otherFilters;
      }
      const filterValue = config.type === "number" ? Number(val) : val;
      if (config.type === "number" && !Number.isFinite(filterValue)) {
        return prev;
      }
      let op: IFilter["op"] = "eq";
      if (config.type === "text") op = "match";
      if (config.type === "multi-select") op = "in";
      return [...otherFilters, {
        key: dataKey,
        op,
        val: filterValue
      }];
    });
  };
  const open = Boolean(anchorEl);
  const inputId = useId();
  const options = config.options ?? [];
  const selected = Array.isArray(currentFilter?.val) ? currentFilter.val : [currentFilter?.val];
  const selectValue = config.type === 'multi-select' ? options.flatMap((option, index) => selected.includes(option.value) ? [String(index)] : []) : String(options.findIndex(option => Object.is(option.value, currentFilter?.val))).replace('-1', '');
  return <>
    <IconButton aria-label={config.filterLabel || 'Filtra colonna'} aria-haspopup="dialog" aria-expanded={open} size="small" onClick={handleOpen} color={currentFilter ? 'primary' : 'default'} className={['filter-icon', currentFilter ? 'active' : '', open ? 'open' : ''].join(' ')}><FilterAlt fontSize="inherit" /></IconButton>
    <NativeDialog open={open} anchor={anchorEl} onClose={handleClose} title={config.filterLabel || 'Filtro colonna'}>
      <div className="tbl-filter-fields">
      <label className="tbl-field" htmlFor={inputId}>
        {config.filterLabel || (config.type === 'text' ? 'Cerca...' : config.type === 'number' ? 'Valore' : config.type === 'date' ? 'Data' : 'Filtra')}
        {config.type === 'select' || config.type === 'multi-select' ? <select id={inputId} className="tbl-select" autoFocus multiple={config.type === 'multi-select'} value={selectValue} onChange={event => {
            const values = Array.from(event.currentTarget.selectedOptions).filter(option => option.value !== '').map(option => options[Number(option.value)].value);
            handleFilterChange(config.type === 'multi-select' ? values : values[0] ?? null);
          }}>
          {config.type === 'select' && <option value="">Tutti</option>}
          {options.map((option, index) => <option key={index} value={String(index)}>{option.label}</option>)}
        </select> : <input id={inputId} className="tbl-input" type={config.type === 'number' ? 'number' : config.type === 'date' ? 'date' : 'text'} autoFocus placeholder={config.placeholder} value={String(currentFilter?.val ?? '')} onChange={event => handleFilterChange(event.target.value)} />}
      </label>
      <Button size="small" disabled={!currentFilter} onClick={() => {
          handleFilterChange(null);
          handleClose();
        }}>Reset</Button>
      </div>
    </NativeDialog>
  </>;
};
export { FilterMenu };
