export function computeDocumentTotals(items=[]){
  const normalized=items.map((x,i)=>({description:String(x.description||'Service').trim(),comment:String(x.comment||'').trim()||null,quantity:Number(x.quantity||1),unit_price:Number(x.unit_price||0),vat_rate:Number(x.vat_rate||0),sort_order:i}));
  const subtotal=normalized.reduce((s,x)=>s+x.quantity*x.unit_price,0);
  const vat=normalized.reduce((s,x)=>s+(x.quantity*x.unit_price*x.vat_rate/100),0);
  return {items:normalized,subtotal:+subtotal.toFixed(2),vat:+vat.toFixed(2),total:+(subtotal+vat).toFixed(2)};
}
export function addDays(date,days){const d=new Date(`${date||new Date().toISOString().slice(0,10)}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+Number(days||0));return d.toISOString().slice(0,10)}
