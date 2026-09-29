import type { Product } from "./types";

const imgs = {
  ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",
  earrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85",
  necklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
  bangle: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85",
  chain: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85",
  mangalsutra: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1200&q=85"
};

export const sampleProducts: Product[] = [
  { id:"demo-1", name:"Floral Heritage Ring", slug:"floral-heritage-ring", category:"rings", description:"A 22K gold ring with traditional floral detailing.", metal:"gold", purity:"22K", gold_weight:4.82, size:"16", huid:"DEMO123456", hallmark_status:"Hallmarked", modification_available:true, availability:"AVAILABLE", featured:true, additional_charges:0, images:[imgs.ring, imgs.ring] },
  { id:"demo-2", name:"Classic Jhumka", slug:"classic-jhumka", category:"earrings", description:"Classic 22K gold jhumka-inspired earrings.", metal:"gold", purity:"22K", gold_weight:6.1, size:null, huid:"DEMO123457", hallmark_status:"Hallmarked", modification_available:false, availability:"AVAILABLE", featured:true, additional_charges:0, images:[imgs.earrings, imgs.earrings] },
  { id:"demo-3", name:"Temple Motif Necklace", slug:"temple-motif-necklace", category:"necklaces", description:"A statement necklace inspired by Indian temple motifs.", metal:"gold", purity:"22K", gold_weight:18.24, size:"18 in", huid:"DEMO123458", hallmark_status:"Hallmarked", modification_available:false, availability:"AVAILABLE", featured:true, additional_charges:1200, images:[imgs.necklace, imgs.necklace] },
  { id:"demo-4", name:"Classic Gold Bangle", slug:"classic-gold-bangle", category:"bangles", description:"A refined bangle with traditional detailing.", metal:"gold", purity:"22K", gold_weight:12.1, size:"2.4", huid:"DEMO123459", hallmark_status:"Hallmarked", modification_available:false, availability:"AVAILABLE", featured:true, additional_charges:0, images:[imgs.bangle, imgs.bangle] },
  { id:"demo-5", name:"Everyday Gold Chain", slug:"everyday-gold-chain", category:"chains", description:"A versatile 22K chain designed for everyday wear.", metal:"gold", purity:"22K", gold_weight:8.32, size:"20 in", huid:"DEMO123460", hallmark_status:"Hallmarked", modification_available:true, availability:"AVAILABLE", featured:true, additional_charges:0, images:[imgs.chain, imgs.chain] },
  { id:"demo-6", name:"Beaded Mangalsutra", slug:"beaded-mangalsutra", category:"mangalsutra", description:"A traditional mangalsutra with pearl additions.", metal:"gold", purity:"22K", gold_weight:15.62, size:"20 in", huid:"DEMO123461", hallmark_status:"Hallmarked", modification_available:true, availability:"AVAILABLE", featured:true, additional_charges:2200, images:[imgs.mangalsutra, imgs.mangalsutra] },
  { id:"demo-7", name:"Petal Ring", slug:"petal-ring", category:"rings", description:"A delicate lightweight 22K gold ring.", metal:"gold", purity:"22K", gold_weight:1.12, size:"14", huid:"DEMO123462", hallmark_status:"Hallmarked", modification_available:true, availability:"RESERVED", featured:false, additional_charges:0, images:[imgs.ring] },
  { id:"demo-8", name:"925 Silver Classic Pair", slug:"925-silver-classic-pair", category:"silver", description:"925 silver jewellery available by manual enquiry.", metal:"silver", purity:"925", gold_weight:null, size:null, huid:null, hallmark_status:"Verify at store", modification_available:false, availability:"AVAILABLE", featured:false, additional_charges:0, images:[imgs.earrings] }
];