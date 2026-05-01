import type { GameResumeMatch } from "../components/game-resume-card";

const ddragon = (path: string) =>
  `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/${path}`;

const perk = (path: string) =>
  `https://ddragon.leagueoflegends.com/cdn/img/perk-images/${path}`;

const champ = (name: string) => ddragon(`champion/${name}.png`);
const spell = (name: string) => ddragon(`spell/${name}.png`);
const item = (id: string) => ddragon(`item/${id}.png`);

const allies = [
  { name: "Darius01", champion: "Aatrox", image: champ("Aatrox") },
  { name: "ShadowVI", champion: "Vi", image: champ("Vi") },
  { name: "MysticAhri", champion: "Ahri", image: champ("Ahri") },
  { name: "PowderJinx", champion: "Jinx", image: champ("Jinx") },
  { name: "TideCaller", champion: "Nami", image: champ("Nami") },
];

const enemies = [
  { name: "VoidOrnn", champion: "Ornn", image: champ("Ornn") },
  { name: "TreeWarden", champion: "Maokai", image: champ("Maokai") },
  { name: "OrianaBot", champion: "Orianna", image: champ("Orianna") },
  { name: "KaisaSky", champion: "Kai'Sa", image: champ("Kaisa") },
  { name: "SunLioness", champion: "Leona", image: champ("Leona") },
];

export const matches: GameResumeMatch[] = [
  {
    result: "win",
    playerSide: "blue",
    playerName: "MysticAhri",
    champion: "Ahri",
    championImage: champ("Ahri"),
    laneOpponent: {
      name: "OrianaBot",
      champion: "Orianna",
      image: champ("Orianna"),
    },
    role: "Mid lane",
    queue: "Solo Ranked",
    duration: "31:10",
    kda: "12/1/9",
    cs: 251,
    lp: 18,
    damageShare: "32%",
    spells: [
      { name: "Flash", image: spell("SummonerFlash") },
      { name: "Ignite", image: spell("SummonerDot") },
    ],
    items: [
      { name: "Luden's", image: item("6655") },
      { name: "Sorcerer's Shoes", image: item("3020") },
      { name: "Shadowflame", image: item("4645") },
      { name: "Rabadon's", image: item("3089") },
      { name: "Void Staff", image: item("3135") },
      { name: "Zhonya's", image: item("3157") },
    ],
    runes: {
      primaryTree: {
        name: "Sorcery",
        image: perk("Styles/Sorcery/Sorcery.png"),
      },
      keystone: {
        name: "Arcane Comet",
        image: perk("Styles/Sorcery/ArcaneComet/ArcaneComet.png"),
      },
    },
    allies,
    enemies,
  },
  {
    result: "loss",
    playerSide: "blue",
    playerName: "PowderJinx",
    champion: "Jinx",
    championImage: champ("Jinx"),
    laneOpponent: {
      name: "KaisaSky",
      champion: "Kai'Sa",
      image: champ("Kaisa"),
    },
    role: "ADC",
    queue: "Solo Ranked",
    duration: "28:44",
    kda: "7/6/4",
    cs: 279,
    lp: -16,
    damageShare: "27%",
    spells: [
      { name: "Flash", image: spell("SummonerFlash") },
      { name: "Heal", image: spell("SummonerHeal") },
    ],
    items: [
      { name: "Stormrazor", image: item("6670") },
      { name: "Infinity Edge", image: item("3031") },
      { name: "Runaan's", image: item("3085") },
      { name: "Mortal Reminder", image: item("3033") },
      { name: "Lord Dominik's", image: item("3036") },
      { name: "Berserker's", image: item("3006") },
    ],
    runes: {
      primaryTree: {
        name: "Precision",
        image: perk("Styles/Precision/Precision.png"),
      },
      keystone: {
        name: "Lethal Tempo",
        image: perk("Styles/Precision/LethalTempo/LethalTempoTemp.png"),
      },
    },
    allies,
    enemies,
  },
  {
    result: "win",
    playerSide: "blue",
    playerName: "ShadowVI",
    champion: "Vi",
    championImage: champ("Vi"),
    laneOpponent: {
      name: "TreeWarden",
      champion: "Maokai",
      image: champ("Maokai"),
    },
    role: "Jungle",
    queue: "Solo Ranked",
    duration: "24:52",
    kda: "9/2/14",
    cs: 176,
    lp: 23,
    damageShare: "21%",
    spells: [
      { name: "Flash", image: spell("SummonerFlash") },
      { name: "Smite", image: spell("SummonerSmite") },
    ],
    items: [
      { name: "Trinity Force", image: item("3078") },
      { name: "Sterak's", image: item("3053") },
      { name: "Dead Man's", image: item("3742") },
      { name: "Black Cleaver", image: item("3071") },
      { name: "Plated Steelcaps", image: item("3047") },
      { name: "Control Ward", image: item("2055") },
    ],
    runes: {
      primaryTree: {
        name: "Precision",
        image: perk("Styles/Precision/Precision.png"),
      },
      keystone: {
        name: "Conqueror",
        image: perk("Styles/Precision/Conqueror/Conqueror.png"),
      },
    },
    allies,
    enemies,
  },
  {
    result: "win",
    playerSide: "red",
    playerName: "Darius01",
    champion: "Aatrox",
    championImage: champ("Aatrox"),
    laneOpponent: { name: "VoidOrnn", champion: "Ornn", image: champ("Ornn") },
    role: "Top lane",
    queue: "Solo Ranked",
    duration: "33:04",
    kda: "8/3/6",
    cs: 289,
    lp: 15,
    damageShare: "24%",
    spells: [
      { name: "Flash", image: spell("SummonerFlash") },
      { name: "Teleport", image: spell("SummonerTeleport") },
    ],
    items: [
      { name: "Eclipse", image: item("6692") },
      { name: "Sundered Sky", image: item("6691") },
      { name: "Spirit Visage", image: item("3065") },
      { name: "Sterak's", image: item("3053") },
      { name: "Plated Steelcaps", image: item("3047") },
      { name: "Control Ward", image: item("2055") },
    ],
    runes: {
      primaryTree: {
        name: "Resolve",
        image: perk("Styles/Resolve/Resolve.png"),
      },
      keystone: {
        name: "Grasp of the Undying",
        image: perk("Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png"),
      },
    },
    allies,
    enemies,
  },
  {
    result: "loss",
    playerSide: "red",
    playerName: "TideCaller",
    champion: "Nami",
    championImage: champ("Nami"),
    laneOpponent: {
      name: "SunLioness",
      champion: "Leona",
      image: champ("Leona"),
    },
    role: "Support",
    queue: "Solo Ranked",
    duration: "27:18",
    kda: "2/8/19",
    cs: 42,
    lp: -13,
    damageShare: "10%",
    spells: [
      { name: "Flash", image: spell("SummonerFlash") },
      { name: "Exhaust", image: spell("SummonerExhaust") },
    ],
    items: [
      { name: "Moonstone", image: item("6617") },
      { name: "Redemption", image: item("3107") },
      { name: "Mikael's", image: item("3222") },
      { name: "Ionian Boots", image: item("3158") },
      { name: "Shurelya's", image: item("2065") },
      { name: "Control Ward", image: item("2055") },
    ],
    runes: {
      primaryTree: {
        name: "Sorcery",
        image: perk("Styles/Sorcery/Sorcery.png"),
      },
      keystone: {
        name: "Summon Aery",
        image: perk("Styles/Sorcery/SummonAery/SummonAery.png"),
      },
    },
    allies,
    enemies,
  },
];
