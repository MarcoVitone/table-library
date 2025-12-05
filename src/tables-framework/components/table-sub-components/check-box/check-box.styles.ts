import {Checkbox as MUICheckbox} from '@mui/material';
import {css, styled} from '@mui/material/styles';

const Checkbox = styled(MUICheckbox)(({theme}) =>
    css({
        color: theme.palette.primary.main
    })
);

export {Checkbox};
