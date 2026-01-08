// src/menuData.ts

/** GitHub Pages(예: /menu/)에서도 public 파일이 깨지지 않게 base를 자동 반영 */
const publicUrl = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

export type Category =
  | "All"
  | "BEEF BBQ"
  | "PORK BBQ"
  | "OTHER BBQ"
  | "HOTPOT"
  | "STEW"
  | "SIDEDISH"
  | "RICE"
  | "NOODLES"
  | "BEVERAGES";

export const categories: Category[] = [
  "All",
  "BEEF BBQ",
  "PORK BBQ",
  "OTHER BBQ",
  "HOTPOT",
  "STEW",
  "SIDEDISH",
  "RICE",
  "NOODLES",
  "BEVERAGES",
];

export type Price =
  | { kind: "fixed"; rm: number }
  | { kind: "market" };

export type Item = {
  id: string;
  name: string;
  desc?: string;
  category: Exclude<Category, "All">;
  tags?: ("Best" | "Spicy")[];
  image: { src: string; alt: string };
  price: Price;
};

export const items: Item[] = [
  //BEEF BBQ  
  {
    id: "beef-bbq-1",
    category: "BEEF BBQ",
    name: "GALBI BONSAL",
    desc: "Boneless short ribs",
    tags: ["Best"],
    image: { src: publicUrl("menu/galbi-bonsal.webp"), alt: "GALBI BONSAL" },
    price: { kind: "market" },
  },
  {
    id: "beef-bbq-2",
    category: "BEEF BBQ",
    name: "SAENG GALBI",
    desc: "Bone-in short ribs",
    image: { src: publicUrl("menu/saeng-galbi.webp"), alt: "SAENG GALBI" },
    price: { kind: "market" },
  },
  {
    id: "beef-bbq-3",
    category: "BEEF BBQ",
    name: "HANWOO DEUNGSIM",
    desc: "Korean beef sirloin",
    image: { src: publicUrl("menu/hanwoo-deungsim.webp"), alt: "HANWOO DEUNGSIM" },
    price: { kind: "market" },
  },
  {
    id: "beef-bbq-4",
    category: "BEEF BBQ",
    name: "WANG GALBI",
    desc: "Short ribs marinated in soy sauce",
    image: { src: publicUrl("menu/wang-galbi.webp"), alt: "WANG GALBI" },
    price: { kind: "market" },
  },

  //PORK BBQ
  {
    id: "pork-bbq-1",
    category: "PORK BBQ",
    name: "SAMGYEOPSAL",
    desc: "Pork belly",
    tags: ["Best"],
    image: { src: publicUrl("menu/samgyeopsal.webp"), alt: "SAMGYEOPSAL" },
    price: { kind: "market" },
  },

  //OTHER BBQ
  
  //HOTPOT
  {
    id: "hotpot-1",
    category: "HOTPOT",
    name: "KIMCHI JJIM",
    desc: "Aged kimchi hotpot with pork belly and ribs.\n•30 mins cooking time",
    image: { src: publicUrl("menu/kimchi-jjim.webp"), alt: "KIMCHI JJIM" },
    price: { kind: "fixed", rm: 140 },
  },

  //STEW
  {
    id: "stew-1",
    category: "STEW",
    name: "KIMCHI JJIGAE",
    desc: "Spicy stew made with kimchi, pork, vegetables and tofu",
    image: { src: publicUrl("menu/kimchi-jjigae.webp"), alt: "KIMCHI JJIGAE" },
    price: { kind: "fixed", rm: 32 },
  },

  //SIDEDISH
  {
    id: "side-1",
    category: "SIDEDISH",
    name: "KIMCHI JEON",
    desc: "Kimchi pancake",
    image: { src: publicUrl("menu/kimchi-jeon.webp"), alt: "KIMCHI JEON" },
    price: { kind: "fixed", rm: 40 },
  },

  //RICE

  //NOODLES
  {
    id: "noodles-1",
    category: "NOODLES",
    name: "MUL NAENGMYEON",
    desc: "Chilled buckwheat noodles.\nserved in beef broth",
    image: { src: publicUrl("menu/mul-naengmyeon.webp"), alt: "MUL NAENGMYEON" },
    price: { kind: "fixed", rm: 30 },
  },
  {
    id: "noodles-2",
    category: "NOODLES",
    name: "BIBIM NAENGMYEON",
    desc: "Chilled buckwheat noodles mixed.\nin spicy sauce",
    image: { src: publicUrl("menu/bibim-naengmyeon.webp"), alt: "BIBIM NAENGMYEON" },
    price: { kind: "fixed", rm: 30 },
  },

  //BEVERAGES
];
