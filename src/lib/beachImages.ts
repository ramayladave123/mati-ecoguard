import dahican from "@/assets/beach-dahican.jpg";
import pujada from "@/assets/beach-pujada.jpg";
import mayo from "@/assets/beach-mayo.jpg";
import waniban from "@/assets/beach-waniban.jpg";
import dinosaur from "@/assets/beach-dinosaur.jpg";
import subangan from "@/assets/beach-subangan.jpg";

const map: Record<string, string> = {
  "beach-dahican": dahican,
  "beach-pujada": pujada,
  "beach-mayo": mayo,
  "beach-waniban": waniban,
  "beach-dinosaur": dinosaur,
  "beach-subangan": subangan,
};

export function beachImage(key?: string | null) {
  if (!key) return dahican;
  return map[key] ?? dahican;
}
