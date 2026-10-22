
/* ---------------- Periodic table data ----------------
   Z|symbol|name|atomic mass (u; bracketed = mass number of the longest-lived isotope)|Pauling electronegativity (blank = none/unknown)|common ions */
const ELEMENT_ROWS=`1|H|Hydrogen|1.008|2.20|H⁺, H⁻
2|He|Helium|4.003||
3|Li|Lithium|6.94|0.98|Li⁺
4|Be|Beryllium|9.012|1.57|Be²⁺
5|B|Boron|10.81|2.04|
6|C|Carbon|12.011|2.55|
7|N|Nitrogen|14.007|3.04|N³⁻
8|O|Oxygen|15.999|3.44|O²⁻
9|F|Fluorine|18.998|3.98|F⁻
10|Ne|Neon|20.180||
11|Na|Sodium|22.990|0.93|Na⁺
12|Mg|Magnesium|24.305|1.31|Mg²⁺
13|Al|Aluminum|26.982|1.61|Al³⁺
14|Si|Silicon|28.085|1.90|
15|P|Phosphorus|30.974|2.19|P³⁻
16|S|Sulfur|32.06|2.58|S²⁻
17|Cl|Chlorine|35.45|3.16|Cl⁻
18|Ar|Argon|39.948||
19|K|Potassium|39.098|0.82|K⁺
20|Ca|Calcium|40.078|1.00|Ca²⁺
21|Sc|Scandium|44.956|1.36|Sc³⁺
22|Ti|Titanium|47.867|1.54|Ti⁴⁺, Ti³⁺
23|V|Vanadium|50.942|1.63|V²⁺, V³⁺
24|Cr|Chromium|51.996|1.66|Cr³⁺, Cr²⁺
25|Mn|Manganese|54.938|1.55|Mn²⁺
26|Fe|Iron|55.845|1.83|Fe²⁺, Fe³⁺
27|Co|Cobalt|58.933|1.88|Co²⁺, Co³⁺
28|Ni|Nickel|58.693|1.91|Ni²⁺
29|Cu|Copper|63.546|1.90|Cu²⁺, Cu⁺
30|Zn|Zinc|65.38|1.65|Zn²⁺
31|Ga|Gallium|69.723|1.81|Ga³⁺
32|Ge|Germanium|72.630|2.01|
33|As|Arsenic|74.922|2.18|As³⁻
34|Se|Selenium|78.971|2.55|Se²⁻
35|Br|Bromine|79.904|2.96|Br⁻
36|Kr|Krypton|83.798|3.00|
37|Rb|Rubidium|85.468|0.82|Rb⁺
38|Sr|Strontium|87.62|0.95|Sr²⁺
39|Y|Yttrium|88.906|1.22|Y³⁺
40|Zr|Zirconium|91.224|1.33|Zr⁴⁺
41|Nb|Niobium|92.906|1.6|
42|Mo|Molybdenum|95.95|2.16|
43|Tc|Technetium|[98]|1.9|
44|Ru|Ruthenium|101.07|2.2|
45|Rh|Rhodium|102.91|2.28|
46|Pd|Palladium|106.42|2.20|Pd²⁺
47|Ag|Silver|107.87|1.93|Ag⁺
48|Cd|Cadmium|112.41|1.69|Cd²⁺
49|In|Indium|114.82|1.78|In³⁺
50|Sn|Tin|118.71|1.96|Sn²⁺, Sn⁴⁺
51|Sb|Antimony|121.76|2.05|
52|Te|Tellurium|127.60|2.1|Te²⁻
53|I|Iodine|126.90|2.66|I⁻
54|Xe|Xenon|131.29|2.60|
55|Cs|Cesium|132.91|0.79|Cs⁺
56|Ba|Barium|137.33|0.89|Ba²⁺
57|La|Lanthanum|138.91|1.10|La³⁺
58|Ce|Cerium|140.12|1.12|Ce³⁺, Ce⁴⁺
59|Pr|Praseodymium|140.91|1.13|Pr³⁺
60|Nd|Neodymium|144.24|1.14|Nd³⁺
61|Pm|Promethium|[145]|1.13|Pm³⁺
62|Sm|Samarium|150.36|1.17|Sm³⁺
63|Eu|Europium|151.96|1.2|Eu³⁺, Eu²⁺
64|Gd|Gadolinium|157.25|1.2|Gd³⁺
65|Tb|Terbium|158.93|1.1|Tb³⁺
66|Dy|Dysprosium|162.50|1.22|Dy³⁺
67|Ho|Holmium|164.93|1.23|Ho³⁺
68|Er|Erbium|167.26|1.24|Er³⁺
69|Tm|Thulium|168.93|1.25|Tm³⁺
70|Yb|Ytterbium|173.05|1.1|Yb³⁺, Yb²⁺
71|Lu|Lutetium|174.97|1.27|Lu³⁺
72|Hf|Hafnium|178.49|1.3|Hf⁴⁺
73|Ta|Tantalum|180.95|1.5|
74|W|Tungsten|183.84|2.36|
75|Re|Rhenium|186.21|1.9|
76|Os|Osmium|190.23|2.2|
77|Ir|Iridium|192.22|2.20|
78|Pt|Platinum|195.08|2.28|Pt²⁺, Pt⁴⁺
79|Au|Gold|196.97|2.54|Au⁺, Au³⁺
80|Hg|Mercury|200.59|2.00|Hg²⁺, Hg₂²⁺
81|Tl|Thallium|204.38|1.62|Tl⁺, Tl³⁺
82|Pb|Lead|207.2|1.87|Pb²⁺, Pb⁴⁺
83|Bi|Bismuth|208.98|2.02|Bi³⁺
84|Po|Polonium|[209]|2.0|
85|At|Astatine|[210]|2.2|
86|Rn|Radon|[222]|2.2|
87|Fr|Francium|[223]|0.7|Fr⁺
88|Ra|Radium|[226]|0.9|Ra²⁺
89|Ac|Actinium|[227]|1.1|Ac³⁺
90|Th|Thorium|232.04|1.3|Th⁴⁺
91|Pa|Protactinium|231.04|1.5|
92|U|Uranium|238.03|1.38|
93|Np|Neptunium|[237]|1.36|
94|Pu|Plutonium|[244]|1.28|
95|Am|Americium|[243]|1.13|
96|Cm|Curium|[247]|1.28|
97|Bk|Berkelium|[247]|1.3|
98|Cf|Californium|[251]|1.3|
99|Es|Einsteinium|[252]||
100|Fm|Fermium|[257]||
101|Md|Mendelevium|[258]||
102|No|Nobelium|[259]||
103|Lr|Lawrencium|[266]||
104|Rf|Rutherfordium|[267]||
105|Db|Dubnium|[268]||
106|Sg|Seaborgium|[269]||
107|Bh|Bohrium|[270]||
108|Hs|Hassium|[277]||
109|Mt|Meitnerium|[278]||
110|Ds|Darmstadtium|[281]||
111|Rg|Roentgenium|[282]||
112|Cn|Copernicium|[285]||
113|Nh|Nihonium|[286]||
114|Fl|Flerovium|[289]||
115|Mc|Moscovium|[290]||
116|Lv|Livermorium|[293]||
117|Ts|Tennessine|[294]||
118|Og|Oganesson|[294]||`;
/* Ground-state electron configurations: fill in Madelung (aufbau) order, then apply the known exceptions. Z ≥ 103 are predicted. */
const ELEMENTS=(()=>{
  const ORB=[['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['4s',2],['3d',10],['4p',6],['5s',2],['4d',10],['5p',6],['6s',2],['4f',14],['5d',10],['6p',6],['7s',2],['5f',14],['6d',10],['7p',6]];
  const EXC={24:{'4s':1,'3d':5},29:{'4s':1,'3d':10},41:{'5s':1,'4d':4},42:{'5s':1,'4d':5},44:{'5s':1,'4d':7},45:{'5s':1,'4d':8},46:{'5s':0,'4d':10},47:{'5s':1,'4d':10},
    57:{'4f':0,'5d':1},58:{'4f':1,'5d':1},64:{'4f':7,'5d':1},78:{'6s':1,'5d':9},79:{'6s':1,'5d':10},89:{'5f':0,'6d':1},90:{'5f':0,'6d':2},91:{'5f':2,'6d':1},92:{'5f':3,'6d':1},93:{'5f':4,'6d':1},96:{'5f':7,'6d':1},103:{'6d':0,'7p':1},111:{'7s':1,'6d':10}};
  const NOBLE=[2,10,18,36,54,86],SYM={2:'He',10:'Ne',18:'Ar',36:'Kr',54:'Xe',86:'Rn'};
  const SUPD='⁰¹²³⁴⁵⁶⁷⁸⁹',sup=n=>String(n).split('').map(d=>SUPD[d]).join('');
  function occupancy(Z){let left=Z;const o=ORB.map(([n,c])=>{const k=Math.min(c,left);left-=k;return [n,k];});const ex=EXC[Z];if(ex)o.forEach(a=>{if(a[0] in ex)a[1]=ex[a[0]];});return o;}
  function config(Z){const occ=occupancy(Z);const core=NOBLE.filter(n=>n<Z).pop();let skip=0,pre='';
    if(core){pre='['+SYM[core]+'] ';const oc=occupancy(core);skip=oc.filter(a=>a[1]>0).length;/* orbitals already full in the core */}
    const coreOcc=core?occupancy(core):[];const rest=occ.filter((a,i)=>a[1]>0&&!(core&&coreOcc[i][1]===a[1]&&coreOcc[i][1]>0));
    return pre+rest.map(a=>a[0]+sup(a[1])).join(' ');}
  /* position in the 18-column table */
  function pos(Z){if(Z===1)return [1,1];if(Z===2)return [1,18];
    const per=Z<=10?2:Z<=18?3:Z<=36?4:Z<=54?5:Z<=86?6:7,first=[0,1,3,11,19,37,55,87][per],off=Z-first;
    if(per<=3)return [per,off<2?off+1:off+11];
    if(per<=5)return [per,off+1];
    if(Z>=57&&Z<=71)return [9,Z-57+3];if(Z>=89&&Z<=103)return [10,Z-89+3];
    if(per===6)return [6,off<2?off+1:Z-72+4];return [7,off<2?off+1:Z-104+4];}
  function cat(Z,r,g){if(Z>=109)return 'unknown';if(Z===1)return 'nonmetal';if([2,10,18,36,54,86].includes(Z))return 'noble gas';if(r===9)return 'lanthanide';if(r===10)return 'actinide';
    if(g===1)return 'alkali metal';if(g===2)return 'alkaline earth metal';if(g===17)return 'halogen';
    if([5,14,32,33,51,52].includes(Z))return 'metalloid';if(g>=3&&g<=12)return 'transition metal';
    if([13,31,49,50,81,82,83,84].includes(Z))return 'post-transition metal';if([6,7,8,15,16,34].includes(Z))return 'nonmetal';return 'post-transition metal';}
  return ELEMENT_ROWS.split('\n').map(l=>{const [z,s,n,m,en,ions]=l.split('|'),Z=+z,[r,g]=pos(Z);
    return {Z,sym:s,name:n,mass:m,en:en?+en:null,ions:ions||'',cfg:config(Z),row:r,col:g,cat:cat(Z,r,g),group:(r>=9)?null:g,period:r>=9?(r===9?6:7):r,pred:Z>=103};});
})();
