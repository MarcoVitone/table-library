require('./helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {TableButton}=require('../src/tables-framework/components/table-sub-components/button/button.tsx');
const {TableCheckbox}=require('../src/tables-framework/components/table-sub-components/check-box/check-box.tsx');
const {TableStatusChip}=require('../src/tables-framework/components/table-sub-components/chip/chip.tsx');
const {ThemeProvider,createTheme,defaultTheme}=require('../src/tables-framework/theme/theme.ts');
const {CollapsibleRow}=require('../src/tables-framework/components/rows/collapsible-row/collapsible-row.tsx');

test('icon-only TableButton forwards its accessible name, native attributes and disabled state',()=>{
 const html=renderToStaticMarkup(React.createElement(TableButton,{variation:'icon-only',label:'Rimuovi riga',icon:'×',disabled:true,title:'Rimuovi',name:'remove',value:'0','data-action':'remove'}));
 assert.match(html,/<button/);assert.match(html,/aria-label="Rimuovi riga"/);assert.match(html,/disabled=""/);assert.match(html,/name="remove"/);assert.match(html,/data-action="remove"/);assert.doesNotMatch(html,/variation=|status=/);
});
test('TableButton preserves caller-supplied disabled on a regular native button',()=>{
 const html=renderToStaticMarkup(React.createElement(TableButton,{label:'Salva',disabled:true,variant:'outlined',sx:{px:2},'aria-label':'Salva modifiche'}));
 assert.match(html,/disabled=""/);assert.match(html,/tbl-button-outlined/);assert.match(html,/padding-left:16px/);assert.match(html,/padding-right:16px/);
});
test('TableCheckbox renders a native named input with its controlled value',()=>{
 const html=renderToStaticMarkup(React.createElement(TableCheckbox,{name:'selection',value:'0',checked:true,disabled:true,inputProps:{'aria-label':'Seleziona riga'}}));
 assert.match(html,/<input/);assert.match(html,/type="checkbox"/);assert.match(html,/checked=""/);assert.match(html,/name="selection"/);assert.match(html,/aria-label="Seleziona riga"/);
});
test('status chip preserves custom colors, label, icon and delete action',()=>{
 const html=renderToStaticMarkup(React.createElement(TableStatusChip,{label:'Attivo',backgroundColor:'#123456',textColor:'#fff',iconColor:'#abcdef',onDelete:()=>{}}));
 assert.match(html,/Attivo/);assert.match(html,/background-color:#123456/);assert.match(html,/<svg/);assert.match(html,/aria-label="Rimuovi"/);
});
test('creating partial themes never mutates defaults or a previously created theme',()=>{
 const before=JSON.stringify(defaultTheme);
 const first=createTheme({typography:{fontFamily:'serif'},palette:{primary:{main:'#123456'}}});
 const second=createTheme({typography:{fontFamily:'monospace'}});
 assert.equal(first.typography.body1.fontFamily,'serif');assert.equal(second.typography.body1.fontFamily,'monospace');assert.equal(first.palette.primary.main,'#123456');assert.equal(JSON.stringify(defaultTheme),before);
 first.palette.primary.main='#abcdef';
 assert.equal(createTheme().palette.primary.main,defaultTheme.palette.primary.main);
});
test('native ThemeProvider applies semantic button color without a Material provider',()=>{
 const html=renderToStaticMarkup(React.createElement(ThemeProvider,{theme:{palette:{error:{main:'#aa1122'}}}},React.createElement(TableButton,{label:'Elimina',variant:'contained',color:'error'})));
 assert.match(html,/--table-button-bg:#aa1122/);
});
test('expanded rows use native details and valid nested table markup',()=>{
 const row={size:1,source:{id:'zero',full:{},flat:{}}};
 const html=renderToStaticMarkup(React.createElement('table',null,React.createElement('tbody',null,React.createElement(CollapsibleRow,{data:row,selectedRowId:'zero'},React.createElement('td',null,'Riga')))));
 assert.match(html,/<details[^>]*open=""/);assert.match(html,/<summary/);assert.match(html,/<table[^>]*><tbody><tr><td>Riga<\/td><\/tr><\/tbody><\/table>/);
});

test('a disabled button rendered as a link removes navigation and advertises its state',()=>{
 const html=renderToStaticMarkup(React.createElement(TableButton,{label:'Apri',href:'/record/0',disabled:true}));
 assert.match(html,/<a/);assert.doesNotMatch(html,/href=/);assert.match(html,/aria-disabled="true"/);assert.match(html,/tabindex="-1"/);
});
