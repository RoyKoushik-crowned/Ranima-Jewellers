import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ message = "Hi Ranima Jewellers, I would like to enquire about your jewellery collection." }: { message?: string }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="luxury-button w-full">
      <MessageCircle size={16} /> Enquire on WhatsApp
    </a>
  );
}